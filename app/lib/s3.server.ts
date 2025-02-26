import { Readable } from 'node:stream';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import type { FileUploadHandler } from '@mjackson/form-data-parser';
import type { MultipartPart } from '@mjackson/multipart-parser';
import { type FileTypeResult, fileTypeFromBuffer } from 'file-type';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from './db';
import { env } from './env.server';

export const s3Client = new S3Client({
	endpoint: env.S3_ENDPOINT,
	forcePathStyle: true,
	region: env.S3_REGION,
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY,
		secretAccessKey: env.S3_SECRET_KEY,
	},
});

function convertToStream(buffer: Buffer) {
	const stream = new Readable();
	stream.push(buffer);
	stream.push(null);
	return stream;
}

export async function uploadStreamToSpaces(
	authorId: string,
	stream: Readable,
	filename: string,
	contentType: FileTypeResult,
) {
	const key = uuidv4();
	const parallelUploads = new Upload({
		client: s3Client,
		params: {
			Bucket: env.S3_BUCKET_NAME,
			Key: `${env.S3_PREFIX}/${key}.${contentType.ext}`,
			Body: stream,
			ContentType: contentType.mime,
		},
	});

	const res = await parallelUploads.done();

	if (!res.Location) {
		throw new Error('Could not upload');
	}

	const createdFile = await prisma.file.create({
		data: {
			id: key,
			filename,
			mimetype: contentType.mime,
			url: res.Location,
			author: { connect: { sub: authorId } },
		},
	});
	return { location: res.Location, fileId: createdFile.id };
}

export const uploadFromUrl = async (authorId: string, url: string) => {
	const response = await fetch(url);
	const buffer = Buffer.from(await response.arrayBuffer());
	const body = convertToStream(buffer);
	const contentType = await fileTypeFromBuffer(buffer);

	if (!contentType) {
		throw new Error('Could not determine file type');
	}

	const uploadedFileLocation = await uploadStreamToSpaces(
		authorId,
		body,
		'',
		contentType,
	);
	return uploadedFileLocation;
};

export const uploadFormDataHandler = (
	authorId: string,
	allowedContentTypes?: string[],
) => {
	const s3UploadHandler: FileUploadHandler = async (file: File) => {
		const buffer = Buffer.from(await file.arrayBuffer());
		const body = convertToStream(buffer);
		const contentType = await fileTypeFromBuffer(buffer);
		if (!contentType) {
			throw new Error('Could not determine file type');
		}

		if (allowedContentTypes) {
			let canUpload = false;
			for (const allowedType of allowedContentTypes) {
				if (contentType.mime === allowedType) {
					canUpload = true;
					break;
				}
			}

			if (!canUpload) {
				throw new Error('File type not allowed');
			}
		}

		const uploadedFileLocation = await uploadStreamToSpaces(
			authorId,
			body,
			file.name,
			contentType,
		);

		return JSON.stringify(uploadedFileLocation);
	};

	return { s3UploadHandler };
};
export const uploadMultipartHandler = (
	authorId: string,
	allowedContentTypes?: string[],
) => {
	const s3UploadHandler = async (part: MultipartPart) => {
		const formData = new FormData();
		if (!part.name) {
			throw new Error('No name provided');
		}
		if (part.isFile === false) {
			formData.append(part.name, await part.text());
			return formData;
		}
		if (!part.filename) {
			throw new Error('No filename provided');
		}

		const buffer = Buffer.from(await part.bytes());
		const body = convertToStream(buffer);
		const contentType = await fileTypeFromBuffer(buffer);
		if (!contentType) {
			throw new Error('Could not determine file type');
		}

		if (allowedContentTypes) {
			let canUpload = false;
			for (const allowedType of allowedContentTypes) {
				if (contentType.mime === allowedType) {
					canUpload = true;
					break;
				}
			}

			if (!canUpload) {
				throw new Error('File type not allowed');
			}
		}

		const createdFile = await uploadStreamToSpaces(
			authorId,
			body,
			part.filename,
			contentType,
		);

		formData.append(
			part.name,
			JSON.stringify({
				url: createdFile.location,
				fileId: createdFile.fileId,
			}),
		);
		return formData;
	};

	return { s3UploadHandler };
};

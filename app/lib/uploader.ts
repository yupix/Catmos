import { parseFormData } from '@mjackson/form-data-parser';
import { parseMultipartRequest } from '@mjackson/multipart-parser';
import type { User } from './auth/auth.server';
import { uploadFormDataHandler, uploadMultipartHandler } from './s3.server';

export async function formDataHandler({
	request,
	user,
}: { request: Request; user: User }) {
	const formData = await parseFormData(
		request,
		uploadFormDataHandler(user.sub).s3UploadHandler,
	);
	return formData;
}
/**
 * Handles file uploads by parsing multipart requests and uploading files to S3.
 *
 * @param param0 - An object containing the request and user information.
 * @returns A FormData object containing the uploaded files.
 */
export async function multipartUploader({
	request,
	user,
}: { request: Request; user: User }) {
	const formData: FormData = new FormData();
	await parseMultipartRequest(request, async (part) => {
		const _formData = await uploadMultipartHandler(user.sub).s3UploadHandler(
			part,
		);

		for (const [key, value] of _formData.entries()) {
			formData.append(key, value);
		}
	});

	return formData;
}

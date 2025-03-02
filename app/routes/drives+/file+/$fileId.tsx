import { useCallback } from 'react';
import { TbCopy } from 'react-icons/tb';
import { data, useLoaderData } from 'react-router';
import { toast } from 'sonner';
import { FileViewer } from '~/components/file-viewer';
import { prisma } from '~/lib/db';
import { getDateFormatted } from '~/lib/utils';
import type { Route } from './+types/$fileId';

export const loader = async ({ params }: Route.LoaderArgs) => {
	const fileId = params.fileId;
	const foundFile = await prisma.file.findFirst({
		where: {
			id: fileId,
		},
	});

	if (!foundFile) throw data('Not Found', { status: 404 });

	return { file: foundFile };
};

export default function Index() {
	const { file } = useLoaderData<typeof loader>();

	const copyHandler = useCallback(() => {
		navigator.clipboard
			.writeText(file.url)
			.then(() => {
				toast.success('URLをコピーしました');
			})
			.catch((err) => {
				console.error('Failed to copy URL: ', err);
			});
	}, [file.url]);

	return (
		<div>
			<div className="mb-4">
				<FileViewer file={file} className="xs:w-full" />
			</div>

			<h4 className="font-semibold mb-8">{file.filename}</h4>
			<div className="mb-6">
				<h5 className="text-gray-400 text-xs">ファイルタイプ</h5>
				<p className="text-gray-500 text-sm">{file.mimetype}</p>
			</div>
			<div className="mb-6">
				<h5 className="text-gray-400 text-xs">アップロード日</h5>
				<p className="text-gray-500 text-sm">
					{getDateFormatted(file.createdAt)}
				</p>
			</div>
			<div className="mb-6">
				<h5 className="text-gray-400 text-xs">URL</h5>
				<div className="flex items-center gap-2">
					<p className="text-gray-500 text-sm">{file.url}</p>
					<TbCopy
						className="cursor-pointer text-blue-500"
						onClick={copyHandler}
					/>
				</div>
			</div>

			<div className="mb-8">{/* <h5 className="">ファイルサイズ</h5> */}</div>
		</div>
	);
}

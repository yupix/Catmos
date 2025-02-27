import type { File as FileModel } from '@prisma/client';

interface FileViewerProps {
	file: FileModel;
}

export function FileViewer({ file }: FileViewerProps) {
	switch (file.mimetype.split('/')[0]) {
		case 'image':
			return (
				<img
					src={file.url}
					alt={file.filename}
					className="mb-2 h-full max-h-[400px] @min-[500px]:w-[calc(50%-8px)] rounded-sm object-contain object-center md:mb-0"
				/>
			);
		case 'video':
			return (
				<video
					muted
					key={file.id}
					src={file.url}
					controls
					className="mb-2 h-full max-h-[400px] @min-[500px]:w-[calc(50%-8px)] rounded-sm object-contain object-center md:mb-0"
				/>
			);
		default:
			return (
				<div>
					<div>{file.filename}</div>
				</div>
			);
	}
}

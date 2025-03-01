import type { File as FileModel } from '@prisma/client';
import type { FCX } from 'react';
import { cn } from '~/lib/utils';

interface FileViewerProps {
	file: FileModel;
	isCompact?: boolean;
}

export const FileViewer: FCX<FileViewerProps> = ({
	file,
	className,
	isCompact,
}) => {
	switch (file.mimetype.split('/')[0]) {
		case 'image':
			return (
				<img
					src={file.url}
					alt={file.filename}
					className={cn(
						'object-contain w-20 ',
						className,
						!isCompact && 'xs:w-[calc(50%-8px)] md:aspect-video',
					)}
					style={{
						background: !isCompact
							? 'repeating-linear-gradient(45deg, #f3f4f6, #f3f4f6 10px, #e5e7eb 10px, #e5e7eb 20px)'
							: undefined,
					}}
				/>
			);
		case 'video':
			return (
				<video
					muted
					key={file.id}
					src={file.url}
					controls
					className={cn(
						'mb-2 h-full max-h-[400px] @min-[500px]:w-[calc(50%-8px)] rounded-sm object-contain object-center md:mb-0',
						className,
					)}
				/>
			);
		default:
			return (
				<div>
					<div>{file.filename}</div>
				</div>
			);
	}
};

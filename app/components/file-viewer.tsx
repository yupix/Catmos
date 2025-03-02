import type { File as FileModel } from '@prisma/client';
import type { FC } from 'react';
import { cn } from '~/lib/utils';

interface FileViewerProps {
	file: FileModel;
	isCompact?: boolean;
	className: string;
	onClick?: () => void;
	ref?: React.Ref<HTMLImageElement | HTMLVideoElement>;
}

/**
 * ファイルを表示するコンポーネント
 * @param {FileViewerProps} props - ファイルと表示オプション
 * @returns {JSX.Element} ファイル表示コンポーネント
 */
export const FileViewer: FC<FileViewerProps> = ({
	file,
	className,
	isCompact,
	onClick,
	ref,
}) => {
	switch (file.mimetype.split('/')[0]) {
		case 'image':
			return (
				<img
					src={file.url}
					alt={file.filename}
					className={cn(
						'object-contain aspect-video',
						!isCompact && 'xs:w-[calc(50%-8px)]',
						className,
					)}
					style={{
						background: !isCompact
							? 'repeating-linear-gradient(45deg, #f3f4f6, #f3f4f6 10px, #e5e7eb 10px, #e5e7eb 20px)'
							: undefined,
					}}
					onClick={onClick}
					onKeyDown={onClick}
					ref={ref as React.Ref<HTMLImageElement>}
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
						'object-contain aspect-video mb-2 h-full max-h-[400px] @min-[500px]:w-[calc(50%-8px)] rounded-sm object-center md:mb-0',
						className,
					)}
					onClick={onClick}
					onKeyDown={onClick}
					ref={ref as React.Ref<HTMLVideoElement>}
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

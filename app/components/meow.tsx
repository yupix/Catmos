import { TbArrowBack, TbDots, TbPlus, TbQuote, TbRepeat } from 'react-icons/tb';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { Form } from 'react-router';
import { useModal } from '~/hooks/use-modal';
import type { IMeow } from '~/lib/const.server';
import { parseTextToTree, renderTree } from '~/lib/meow-tree';
import { cn, getUserName } from '~/lib/utils';
import { HoverUserCard } from './hover-user-card';
import { TimeDisplay } from './meow/time';
import { PostModal } from './post-modal';
import { Avatar, AvatarFallback, AvatarImage } from './shadcn/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './shadcn/ui/dropdown-menu';
import 'react-photo-view/dist/react-photo-view.css';
import { useCallback } from 'react';
import { FileViewer } from './file-viewer';
import { MeowMoreMenu } from './meow/more-menu';

export type MeowProps = {
	meow: IMeow;
	hideDate?: boolean;
	disableActions?: boolean;
	type?: 'normal' | 'reply';
	size?: 'xs' | 'sm' | 'md';
};

/**
 * Meowコンポーネント
 * @param {MeowProps} props - Meowコンポーネントのプロパティ
 * @returns {JSX.Element} Meowコンポーネント
 */
export function Meow(props: MeowProps) {
	// 返信がある場合は先に返信を少しpaddingして表示して下にメインのメウを表示する
	if (props.meow.reply) {
		return (
			<div className="flex flex-col">
				<div className="">
					<Render
						meow={props.meow.reply}
						size={'sm'}
						disableActions
						hideDate={props.hideDate}
					/>
				</div>
				<Render
					meow={props.meow}
					disableActions={props.disableActions}
					type={props.meow.replyId !== null ? 'reply' : undefined}
					size={props.size}
					hideDate={props.hideDate}
				/>
			</div>
		);
	}

	return <Render {...props} />;
}

/**
 * Renderコンポーネント
 * @param {MeowProps} props - Meowコンポーネントのプロパティ
 * @returns {JSX.Element} Renderコンポーネント
 */
const Render = ({ meow, disableActions, type, size, hideDate }: MeowProps) => {
	const tree = parseTextToTree(meow.text ?? '');
	const isSmall = size === 'xs' || size === 'sm';
	const { openModal, closeModal } = useModal();

	const handleReplyClick = useCallback(() => {
		openModal(<PostModal replyTo={meow} closeModal={closeModal} />);
	}, [openModal, closeModal, meow]);

	if (meow.remeow) {
		return (
			<div>
				<span className="mb-2 flex items-center justify-between gap-2 overflow-hidden whitespace-nowrap text-nowrap px-4">
					<div className="flex shrink-[9999] items-center gap-2 overflow-hidden whitespace-nowrap text-nowrap text-sky-600">
						<Avatar className="h-8 w-8">
							<AvatarImage src={meow.author.avatarUrl} alt={meow.author.name} />
							<AvatarFallback>{meow.author.name}</AvatarFallback>
						</Avatar>
						<TbRepeat className="mr-1 shrink-0" strokeWidth={3} />
						<div className="flex gap-2">
							<span className="shrink-0">Remeow by</span>
							<span className="shrink-99999 truncate font-semibold">
								{getUserName(meow.author)}
							</span>
						</div>
					</div>
					<div className="shirnk-0">
						<TimeDisplay date={meow.createdAt} />
					</div>
				</span>
				<Render meow={meow.remeow} size={size} hideDate />
			</div>
		);
	}

	const content = (
		<div className="px-4">
			<div className="flex gap-2">
				<HoverUserCard user={meow.author}>
					<Avatar
						className={cn(
							'h-15 w-15',
							size === 'sm' && 'h-10 w-10',
							size === 'xs' && 'h-8 w-8',
						)}
					>
						<AvatarImage src={meow.author.avatarUrl} alt={meow.author.name} />
						<AvatarFallback>{meow.author.name}</AvatarFallback>
					</Avatar>
				</HoverUserCard>
				<div
					className={cn(
						'w-full overflow-hidden',
						size === 'xs' && 'text-[13px]',
					)}
				>
					<div className="flex justify-between">
						<HoverUserCard
							user={meow.author}
							className="shrink-999999 overflow-hidden overflow-ellipsis whitespace-nowrap"
						>
							{meow.author.displayName || meow.author.name}
							{meow.author.displayName ? `@${meow.author.name}` : null}
						</HoverUserCard>

						{hideDate ? null : (
							<div className="shrink-0">
								<TimeDisplay date={meow.createdAt} />
							</div>
						)}
					</div>
					<div className="mb-5 pt-2">
						<div className="flex">
							{type === 'reply' ? (
								<TbArrowBack className="mr-1 text-sky-600" strokeWidth={3} />
							) : null}
							<div className="inline-block break-all">{renderTree(tree)}</div>
						</div>

						{meow.attachments.length > 0 ? (
							<div className="@container">
								<div
									className={cn(
										'mt-2 flex @max-[300px]:flex-col flex-wrap gap-2',
										isSmall && '@min-[500px]:max-w-[40%]',
									)}
								>
									<PhotoProvider>
										{meow.attachments.map((attachment) =>
											attachment.mimetype.startsWith('image/') ? (
												<PhotoView key={attachment.id} src={attachment.url}>
													<FileViewer file={attachment} />
												</PhotoView>
											) : attachment.mimetype.startsWith('video/') ? (
												<FileViewer key={attachment.id} file={attachment} />
											) : null,
										)}
									</PhotoProvider>
								</div>
							</div>
						) : null}
					</div>
					<div className="@container w-full">
						{disableActions ? null : (
							<div className="flex flex-wrap @min-[300px]:gap-14 gap-2 text-slate-400 text-xl">
								<TbArrowBack
									className="cursor-pointer"
									strokeWidth={3}
									onClick={handleReplyClick}
								/>
								<DropdownMenu>
									<DropdownMenuTrigger>
										<TbRepeat
											className="shrink-0 cursor-pointer"
											strokeWidth={3}
										/>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<Form action="/?index" method="POST">
											<input type="hidden" name="intent" value="post" />
											<input type="hidden" name="remeowId" value={meow.id} />
											<DropdownMenuItem className="cursor-pointer">
												<button
													type="submit"
													className="flex w-full items-center gap-2"
												>
													<TbRepeat strokeWidth={2} />
													ReMeow
												</button>
											</DropdownMenuItem>
										</Form>
										<DropdownMenuItem className="cursor-pointer">
											<TbQuote strokeWidth={2} />
											Quote
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
								<TbPlus className="shrink-0 cursor-pointer" strokeWidth={3} />
								<MeowMoreMenu meow={meow}>
									<TbDots className="shrink-0 cursor-pointer" strokeWidth={3} />
								</MeowMoreMenu>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);

	return isSmall ? content : content;
	// <MeowContextMenu meow={meow}>{content}</MeowContextMenu>
};

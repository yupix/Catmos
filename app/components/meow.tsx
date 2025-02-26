import type { File, Meow, User } from '@prisma/client';
import { TbArrowBack, TbDots, TbPlus, TbQuote, TbRepeat } from 'react-icons/tb';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { Form } from 'react-router';
import { useModal } from '~/hooks/use-modal';
import { parseTextToTree, renderTree } from '~/lib/meow-tree';
import { cn, getUserName } from '~/lib/utils';
import { HoverUserCard } from './hover-user-card';
import { TimeDisplay } from './meow/time';
import { PostModal } from './post-modal';
import { Avatar, AvatarFallback, AvatarImage } from './shadcn/ui/avatar';
import {} from './shadcn/ui/context-menu';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './shadcn/ui/dropdown-menu';
import 'react-photo-view/dist/react-photo-view.css';
import { MeowMoreMenu } from './meow/more-menu';
export type IMeow = Meow & {
	author: User;
	reply: IMeow;
	remeow: IMeow;
	attachments: File[];
};

export type MeowProps = {
	meow: IMeow;
	disableActions?: boolean;
	type?: 'normal' | 'reply';
	isSmall?: boolean;
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
					<Render meow={props.meow.reply} isSmall disableActions />
				</div>
				<Render
					meow={props.meow}
					disableActions={props.disableActions}
					type={props.meow.replyId !== null ? 'reply' : undefined}
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
const Render = ({ meow, disableActions, type, isSmall }: MeowProps) => {
	const tree = parseTextToTree(meow.text ?? '');

	const { openModal, closeModal } = useModal();
	if (meow.remeow) {
		return (
			<div>
				<span className="mb-2 flex items-center gap-2 px-4 text-sky-600">
					<Avatar className="h-8 w-8">
						<AvatarImage src={meow.author.avatarUrl} alt={meow.author.name} />
						<AvatarFallback>{meow.author.name}</AvatarFallback>
					</Avatar>
					<TbRepeat className="mr-1" strokeWidth={3} />
					<span>Remeow by</span>
					<span className="font-semibold">{getUserName(meow.author)}</span>
				</span>
				<Render meow={meow.remeow} disableActions />
			</div>
		);
	}

	const content = (
		<div className="px-4">
			<div className="flex gap-2">
				<HoverUserCard user={meow.author}>
					<Avatar className={cn('h-15 w-15', isSmall && 'h-10 w-10')}>
						<AvatarImage src={meow.author.avatarUrl} alt={meow.author.name} />
						<AvatarFallback>{meow.author.name}</AvatarFallback>
					</Avatar>
				</HoverUserCard>
				<div className="w-full">
					<div className="flex justify-between">
						<HoverUserCard user={meow.author}>
							<div className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap">
								<p className="max-w-40 overflow-hidden text-ellipsis whitespace-nowrap">
									{meow.author.displayName || meow.author.name}{' '}
									{meow.author.displayName ? `@${meow.author.name}` : null}
								</p>
							</div>
						</HoverUserCard>

						<TimeDisplay date={meow.createdAt} />
					</div>
					<div className="mb-5 pt-2">
						<div className="flex">
							{type === 'reply' ? (
								<TbArrowBack className="mr-1 text-sky-600" strokeWidth={3} />
							) : null}
							<div className="inline-block break-all">{renderTree(tree)}</div>
						</div>

						{meow.attachments.length > 0 ? (
							<div
								className={cn(
									'mt-2 block md:flex md:max-w-[80%] md:flex-wrap md:gap-2',
									isSmall && 'max-w-[80%] md:max-w-[40%]',
								)}
							>
								<PhotoProvider>
									{meow.attachments.map((attachment) =>
										attachment.mimetype.startsWith('image/') ? (
											<PhotoView key={attachment.id} src={attachment.url}>
												<img
													src={attachment.url}
													alt={attachment.filename}
													className="mb-2 max-h-[300px] rounded-sm object-contain object-center md:mb-0 md:w-[calc(50%-8px)]"
												/>
											</PhotoView>
										) : (
											<div key={attachment.id}>
												<p>{attachment.filename}</p>
											</div>
										),
									)}
								</PhotoProvider>
							</div>
						) : null}
					</div>
					{disableActions ? null : (
						<div className="flex gap-14 text-slate-400 text-xl">
							<TbArrowBack
								className="cursor-pointer"
								strokeWidth={3}
								onClick={() =>
									openModal(
										<PostModal replyTo={meow} closeModal={closeModal} />,
									)
								}
							/>
							<DropdownMenu>
								<DropdownMenuTrigger>
									<TbRepeat className="cursor-pointer" strokeWidth={3} />
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
							<TbPlus className="cursor-pointer" strokeWidth={3} />
							<MeowMoreMenu meow={meow}>
								<TbDots className="cursor-pointer" strokeWidth={3} />
							</MeowMoreMenu>
						</div>
					)}
				</div>
			</div>
		</div>
	);

	return isSmall
		? content
		: content;
			// <MeowContextMenu meow={meow}>{content}</MeowContextMenu>
};

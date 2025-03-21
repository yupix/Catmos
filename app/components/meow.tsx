import { TbArrowBack, TbArrowRight, TbRepeat } from 'react-icons/tb';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { Link, useFetcher, useRouteLoaderData } from 'react-router';
import type { IMeow } from '~/lib/const.server';
import { parseTextToTree, renderTree } from '~/lib/meow-tree';
import { cn, getUserName } from '~/lib/utils';
import { HoverUserCard } from './hover-user-card';
import { TimeDisplay } from './meow/time';
import { Avatar, AvatarFallback, AvatarImage } from './shadcn/ui/avatar';
import 'react-photo-view/dist/react-photo-view.css';
import { motion } from 'motion/react';
import { type FC, useEffect, useMemo, useState } from 'react';
import type { loader as reactionLoader } from '~/routes/api+/meows+/$meowId+/reactions';
import { FileViewer } from './file-viewer';
import { MeowAction } from './meow/action';
import { MeowHeader } from './meow/header';
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from './shadcn/ui/hover-card';

export type MeowProps = {
	meow: IMeow;
	disableActions?: boolean;
	type?: 'normal' | 'reply';
	size?: 'xs' | 'sm' | 'md';
	isCompactFile?: boolean;
	depth?: number;
};

export function Meow(props: MeowProps) {
	const depth = props.depth ?? 0;
	if (props.meow.reply) {
		return (
			<div className="flex flex-col">
				<div className="">
					<Render
						meow={props.meow.reply}
						size={'sm'}
						depth={depth + 1}
						disableActions
						isCompactFile
					/>
				</div>
				<Render
					meow={props.meow}
					disableActions={props.disableActions}
					type={props.meow.replyId !== null ? 'reply' : undefined}
					size={props.size}
				/>
			</div>
		);
	}

	return <Render {...props} />;
}

const Render = ({
	meow,
	disableActions,
	type,
	depth,
	size,
	isCompactFile,
}: MeowProps) => {
	const tree = parseTextToTree(meow.text ?? '');
	const isSmall = size === 'xs' || size === 'sm';

	const [showFile, setShowFile] = useState<boolean>(!isCompactFile);
	const [reactionDetail, setReactionDetail] = useState<Awaited<
		ReturnType<typeof reactionLoader>
	> | null>(null);

	const reactionFetcher = useFetcher<typeof reactionLoader>();
	const data = useRouteLoaderData('root');

	useEffect(() => {
		if (reactionFetcher.data) {
			setReactionDetail(reactionFetcher.data);
		}
	}, [reactionFetcher]);

	const handleFileToggle = () => {
		setShowFile((prev) => !prev);
	};

	const handleEmojiHover = (emoji: string) => {
		// 再レンダリングされたときに同じemojiがhoverされた場合は何もしない
		if (reactionDetail?.reaction === emoji) {
			return;
		}

		const actionURI = encodeURI(
			`/api/meows/${meow.id}/reactions?reaction=${emoji}`,
		);

		reactionFetcher.load(actionURI);
	};

	const isReacted = useMemo(() => {
		return meow.MeowReaction.some(
			(reaction) => reaction.userId === data.user.id,
		);
	}, [meow.MeowReaction, data.user.id]);

	const reactionCounts = useMemo(() => {
		const counts: { [key: string]: number } = {};
		for (const reaction of meow.MeowReaction) {
			counts[reaction.reaction] = (counts[reaction.reaction] || 0) + 1;
		}
		return counts;
	}, [meow.MeowReaction]);

	if (meow.remeow) {
		return (
			<div>
				<span
					className={cn(
						'mb-2 flex items-center justify-between gap-2 overflow-hidden whitespace-nowrap text-nowrap px-4',
						size === 'xs' && 'text-[13px]',
					)}
				>
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
				<Render meow={meow.remeow} size={size} isCompactFile />
			</div>
		);
	}

	const ReactionContent: FC<{ reaction: string; count: number }> = ({
		reaction,
		count,
	}) => (
		<div
			className={cn(
				'flex select-none items-center gap-2 rounded-lg p-2 hover:bg-slate-50',
				isReacted ? 'cursor-not-allowed' : 'cursor-pointer',
			)}
			onMouseEnter={() => handleEmojiHover(reaction)}
		>
			<img
				src={`https://cdn.jsdelivr.net/npm/fluentui-emoji@latest/icons/flat/${reaction}.svg`}
				alt={reaction}
				className="h-8 w-8"
			/>
			<span>{count}</span>
		</div>
	);

	const content = (
		<div className={cn('px-4', (depth ?? 0) > 0 && 'text-[.8rem]')}>
			<div className="flex gap-2">
				<HoverUserCard user={meow.author}>
					<Link to={`/${meow.author.name}`}>
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
					</Link>
				</HoverUserCard>
				<div className={cn('w-full overflow-hidden')}>
					<MeowHeader meow={meow} />
					<div className="mb-5 pt-1">
						<div className="flex items-center">
							{type === 'reply' ? (
								<TbArrowBack className="mr-1 text-sky-600" strokeWidth={3} />
							) : null}
							<div className="inline-block break-all">{renderTree(tree)}</div>
						</div>

						{meow.attachments.length > 0 ? (
							<>
								{isCompactFile ? (
									<div
										onClick={handleFileToggle}
										onKeyDown={handleFileToggle}
										className="flex cursor-pointer gap-1"
									>
										<motion.div
											initial={{ rotate: 0 }}
											animate={{ rotate: showFile ? 90 : 0 }}
										>
											<TbArrowRight />
										</motion.div>
										<p>{meow.attachments.length}つのファイル</p>
									</div>
								) : null}
								<div
									className={cn('@container', showFile ? 'block' : 'hidden')}
								>
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
							</>
						) : null}
					</div>
					{isSmall ? null : (
						<div className="flex gap-2">
							{Object.entries(reactionCounts).map(([reaction, count]) =>
								reactionDetail?.reaction === reaction ? (
									<HoverCard key={reaction}>
										<HoverCardTrigger>
											<ReactionContent reaction={reaction} count={count} />
										</HoverCardTrigger>
										<HoverCardContent className="bg-white/10 text-xs backdrop-blur-sm">
											{reactionDetail.reactions.map((react) => (
												<div key={react.id} className="flex items-center gap-1">
													<Avatar className="h-7 w-7">
														<AvatarImage src={react.user.avatarUrl} />
														<AvatarFallback>{react.user.name}</AvatarFallback>
													</Avatar>
													<p>{react.user.name}</p>
												</div>
											))}
										</HoverCardContent>
									</HoverCard>
								) : (
									<ReactionContent
										key={reaction}
										reaction={reaction}
										count={count}
									/>
								),
							)}
						</div>
					)}
					<div className="@container w-full">
						{disableActions ? null : <MeowAction meow={meow} isReacted />}
					</div>
				</div>
			</div>
		</div>
	);

	return isSmall ? content : content;
};

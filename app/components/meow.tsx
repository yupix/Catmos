import type { File, Meow, User } from '@prisma/client';
import { TbArrowBack, TbDots, TbPlus, TbRepeat } from 'react-icons/tb';
import { useModal } from '~/hooks/use-modal';
import { parseTextToTree, renderTree } from '~/lib/meow-tree';
import { cn, getDateTimeString } from '~/lib/utils';
import { HoverUserCard } from './hover-user-card';
import { PostModal } from './post-modal';
import { Avatar, AvatarFallback, AvatarImage } from './shadcn/ui/avatar';

export type IMeow = Meow & {
	author: User;
	reply: IMeow;
	attachments: File[];
};

export type MeowProps = {
	meow: IMeow;
	disableActions?: boolean;
	type?: 'normal' | 'reply';
	isSmall?: boolean;
};

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

function Render({ meow, disableActions, type, isSmall }: MeowProps) {
	const dateInfo = getDateTimeString(meow.createdAt);
	const tree = parseTextToTree(meow.text);

	const { openModal, closeModal } = useModal();

	return (
		<div className="max-w-[700px] px-4">
			<div className="flex gap-4">
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
									<span className="ml-1 text-gray-400">
										@{meow.author.name}
									</span>
								</p>
							</div>
						</HoverUserCard>

						<time
							className={cn(
								dateInfo.color === 'red'
									? 'text-red-400'
									: dateInfo.color === 'yellow'
										? 'text-yellow-400'
										: null,
							)}
							title={meow.createdAt.toString()}
						>
							{dateInfo.text}
						</time>
					</div>
					<div className="mb-5 pt-2">
						<div className="flex">
							{type === 'reply' ? (
								<TbArrowBack className="mr-1 text-sky-600" strokeWidth={3} />
							) : null}
							{renderTree(tree)}
						</div>
					</div>
					{disableActions ? null : (
						<div className="flex gap-4 text-slate-700 ">
							<TbArrowBack
								className="cursor-pointer"
								strokeWidth={3}
								onClick={() =>
									openModal(
										<PostModal replyTo={meow} closeModal={closeModal} />,
									)
								}
							/>
							<TbRepeat className="cursor-pointer" strokeWidth={3} />
							<TbPlus className="cursor-pointer" strokeWidth={3} />
							<TbDots className="cursor-pointer" strokeWidth={3} />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

import type { File, Meow, User } from '@prisma/client';
import type { JSX } from 'react';
import {
	TbArrowBack,
	TbCopy,
	TbDots,
	TbHeart,
	TbInfoCircle,
	TbLink,
	TbPlus,
	TbRepeat,
} from 'react-icons/tb';
import { Link } from 'react-router';
import { useModal } from '~/hooks/use-modal';
import { parseTextToTree, renderTree } from '~/lib/meow-tree';
import { cn, getDateTimeString } from '~/lib/utils';
import { HoverUserCard } from './hover-user-card';
import { PostModal } from './post-modal';
import { Avatar, AvatarFallback, AvatarImage } from './shadcn/ui/avatar';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from './shadcn/ui/context-menu';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './shadcn/ui/dropdown-menu';

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

const MoreMenuItems = (meowUrl: string) => [
	{
		label: '詳細',
		icon: <TbInfoCircle className="mr-2" strokeWidth={2} />,
		to: meowUrl,
	},
	{
		label: '内容をコピー',
		icon: <TbCopy className="mr-2" strokeWidth={2} />,
	},
	{
		label: 'リンクをコピー',
		icon: <TbLink className="mr-2" strokeWidth={2} />,
		onClick: () => {
			navigator.clipboard.writeText(meowUrl);
		},
	},
	{
		label: 'お気に入り',
		icon: <TbHeart className="mr-2" strokeWidth={2} />,
	},
];

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
 * 共通のメニューアイテムをレンダリングするコンポーネント
 * @param {Object} props - プロパティ
 * @param {React.ReactNode} props.children - 子要素
 * @param {IMeow} props.meow - Meowオブジェクト
 * @param {boolean} props.isContextMenu - コンテキストメニューかどうか
 * @returns {JSX.Element} メニューアイテムコンポーネント
 */
const MenuItems = ({
	children,
	meow,
	isContextMenu,
}: {
	children: React.ReactNode;
	meow: IMeow;
	isContextMenu: boolean;
}) => {
	const handleCopy = () => {
		navigator.clipboard.writeText(meow.text);
	};

	const meowUrl = `${window.location.origin}/meows/${meow.id}`;

	const MenuComponent = isContextMenu ? ContextMenu : DropdownMenu;
	const MenuTriggerComponent = isContextMenu
		? ContextMenuTrigger
		: DropdownMenuTrigger;
	const MenuContentComponent = isContextMenu
		? ContextMenuContent
		: DropdownMenuContent;
	const MenuItemComponent = isContextMenu ? ContextMenuItem : DropdownMenuItem;

	const MenuItemChild = (item: any) => {
		console.log(item.item.icon);
		return (
			<MenuItemComponent
				key={item.item.label}
				onClick={
					item.item.onClick ||
					(item.item.label === '内容をコピー' ? handleCopy : undefined)
				}
			>
				{item.item.icon}
				{item.item.label}
			</MenuItemComponent>
		);
	};

	return (
		<MenuComponent>
			<MenuTriggerComponent>{children}</MenuTriggerComponent>
			<MenuContentComponent>
				{MoreMenuItems(meowUrl).map((item) =>
					item.to ? (
						<Link to={item.to} key={item.label}>
							<MenuItemChild item={item} />
						</Link>
					) : (
						<MenuItemChild item={item} key={item.label} />
					),
				)}
			</MenuContentComponent>
		</MenuComponent>
	);
};

/**
 * MeowContextMenuコンポーネント
 * @param {Object} props - プロパティ
 * @param {React.ReactNode} props.children - 子要素
 * @param {IMeow} props.meow - Meowオブジェクト
 * @returns {JSX.Element} MeowContextMenuコンポーネント
 */
const MeowContextMenu = ({
	children,
	meow,
}: {
	children: React.ReactNode;
	meow: IMeow;
}) => (
	<MenuItems meow={meow} isContextMenu>
		{children}
	</MenuItems>
);

/**
 * MeowMoreMenuコンポーネント
 * @param {Object} props - プロパティ
 * @param {IMeow} props.meow - Meowオブジェクト
 * @param {React.ReactNode} props.children - 子要素
 * @returns {JSX.Element} MeowMoreMenuコンポーネント
 */
const MeowMoreMenu = ({
	meow,
	children,
}: {
	meow: IMeow;
	children: React.ReactNode;
}): JSX.Element => (
	<MenuItems meow={meow} isContextMenu={false}>
		{children}
	</MenuItems>
);

/**
 * Renderコンポーネント
 * @param {MeowProps} props - Meowコンポーネントのプロパティ
 * @returns {JSX.Element} Renderコンポーネント
 */
const Render = ({ meow, disableActions, type, isSmall }: MeowProps) => {
	const dateInfo = getDateTimeString(meow.createdAt);
	const tree = parseTextToTree(meow.text);

	const { openModal, closeModal } = useModal();

	const content = (
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
							<MeowMoreMenu meow={meow}>
								<TbDots className="cursor-pointer" strokeWidth={3} />
							</MeowMoreMenu>
						</div>
					)}
				</div>
			</div>
		</div>
	);

	return isSmall ? (
		content
	) : (
		<MeowContextMenu meow={meow}>{content}</MeowContextMenu>
	);
};

import { useMemo } from 'react';
import {
	TbCopy,
	TbHeart,
	TbHeartOff,
	TbInfoCircle,
	TbLink,
	TbTrash,
} from 'react-icons/tb';
import { Link, useFetcher, useMatches } from 'react-router';
import type { IMeow } from '~/lib/const.server';
import type { Route } from '../../+types/root';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../shadcn/ui/dropdown-menu';

interface MeowMoreMenuProps {
	children: React.ReactNode;
	meow: IMeow;
}

export function MeowMoreMenu({ children, meow }: MeowMoreMenuProps) {
	const meowLink = useMemo(() => `/meows/${meow.id}`, [meow.id]);
	const { user: me } = (useMatches() as Route.ComponentProps['matches'])[0]
		.data;
	const { submit } = useFetcher();

	const handleTextCopy = () => {
		navigator.clipboard.writeText(meow.text ?? '');
	};

	const handleLinkCopy = () => {
		navigator.clipboard.writeText(meowLink);
	};
	const isFavorited = meow.favorites?.length > 0;

	const handleFavorite = () => {
		submit(
			{},
			{
				method: isFavorited ? 'DELETE' : 'POST',
				action: `/api/meows/${meow.id}/favorite`,
			},
		);
	};

	const handleDelete = () => {
		submit(
			{},
			{
				method: 'DELETE',
				action: `/meows/${meow.id}`,
			},
		);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>{children}</DropdownMenuTrigger>
			<DropdownMenuContent>
				<Link to={meowLink}>
					<DropdownMenuItem className="cursor-pointer">
						<TbInfoCircle className="mr-2" strokeWidth={2} />
						詳細
					</DropdownMenuItem>
				</Link>
				<DropdownMenuItem onClick={handleTextCopy} className="cursor-pointer">
					<TbCopy className="mr-2" strokeWidth={2} />
					内容をコピー
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleLinkCopy} className="cursor-pointer">
					<TbLink className="mr-2" strokeWidth={2} />
					リンクをコピー
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleFavorite} className="cursor-pointer">
					{isFavorited ? (
						<>
							<TbHeartOff className="mr-2" strokeWidth={2} />
							お気に入り解除
						</>
					) : (
						<>
							<TbHeart className="mr-2" strokeWidth={2} />
							お気に入り
						</>
					)}
				</DropdownMenuItem>
				{me.id === meow.authorId && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="text-red-400" onClick={handleDelete}>
							<TbTrash className="mr-2 text-red-400" strokeWidth={2} />
							削除
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

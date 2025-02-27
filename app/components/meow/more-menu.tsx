import { useMemo } from 'react';
import { TbCopy, TbHeart, TbInfoCircle, TbLink, TbTrash } from 'react-icons/tb';
import { Link, useFetcher } from 'react-router';
import type { IMeow } from '../meow';
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
	const { submit } = useFetcher();

	const handleTextCopy = () => {
		navigator.clipboard.writeText(meow.text ?? '');
	};

	const handleLinkCopy = () => {
		navigator.clipboard.writeText(meowLink);
	};

	const handleFavorite = () => {
		submit(
			{},
			{
				method: meow.isFavorited ? 'DELETE' : 'POST',
				action: `/api/meows/${meow.id}/favorite`,
			},
		);
	};

	const handleDelete = () => {
		const formData = new FormData();
		formData.append('meowId', meow.id);
		submit(formData, {
			method: 'DELETE',
			action: '/meows/?index',
		});
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
					<TbHeart className="mr-2" strokeWidth={2} />
					{meow.isFavorited ? 'お気に入りを解除' : 'お気に入り'}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="text-red-400" onClick={handleDelete}>
					<TbTrash className="mr-2 text-red-400" strokeWidth={2} />
					削除
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

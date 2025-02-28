import { LoaderCircle } from 'lucide-react';
import { TbMinus, TbPlus } from 'react-icons/tb';
import { useFetcher } from 'react-router';
import type { User } from '~/lib/auth/auth.server';
import type { IUserCard } from '~/lib/const.server';
import { getUserName } from '~/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './shadcn/ui/avatar';
import { Button } from './shadcn/ui/button';

interface ProfileCardProps {
	user: IUserCard;
	me?: User;
}

/**
 * ProfileCardコンポーネント
 * @param {ProfileCardProps} props - ProfileCardコンポーネントのプロパティ
 * @returns {JSX.Element} ProfileCardコンポーネント
 */
export function ProfileCard({ user, me }: ProfileCardProps) {
	const { state, submit } = useFetcher();
	const followHandler = async () => {
		await submit(
			{},
			{
				method: 'POST',
				action: `/api/users/${user.id}/following`,
			},
		);
	};

	const unfollowHandler = async () => {
		await submit(
			{},
			{
				method: 'DELETE',
				action: `/api/users/${user.id}/following`,
			},
		);
	};

	const isFollowing = user.followers.some((follower) => me?.id === follower.id);
	return (
		<div className="relative w-full rounded-lg border pb-4">
			<div
				className="h-30 w-full rounded-t-lg bg-center bg-cover bg-gray-500"
				style={{
					backgroundImage: `url(${user.bannerUrl})`,
				}}
			/>
			<div className="absolute top-2 right-4 z-30">
				{me && me.sub === user.sub ? null : isFollowing ? (
					<Button
						variant="destructive"
						className="rounded-full bg-blue-400 hover:bg-blue-500"
						onClick={async (e) => {
							e.preventDefault();
							await unfollowHandler();
						}}
					>
						フォロー中
						{state !== 'idle' ? (
							<LoaderCircle className="animate-spin" />
						) : (
							<TbMinus />
						)}
					</Button>
				) : (
					<Button
						className="rounded-full bg-blue-400 hover:bg-blue-500"
						onClick={async (e) => {
							e.preventDefault();
							await followHandler();
						}}
					>
						フォロー
						{state !== 'idle' ? (
							<LoaderCircle className="animate-spin" />
						) : (
							<TbPlus />
						)}
					</Button>
				)}
			</div>
			<div className="absolute top-20 right-0 left-0 flex justify-center">
				<div className="rounded-full bg-white p-2">
					<Avatar className="h-16 w-16">
						<AvatarImage src={user?.avatarUrl} />
						<AvatarFallback>{user.name}</AvatarFallback>
					</Avatar>
				</div>
			</div>
			<div className="truncate whitespace-nowrap text-nowrap px-1 pt-12 text-center text-white [text-shadow:_0_2px_4px_rgba(0,0,0,0.8)]">
				<h1 className="">{getUserName(user)}</h1>
				<p className="text-zinc-100">@{user.name}</p>
			</div>
		</div>
	);
}

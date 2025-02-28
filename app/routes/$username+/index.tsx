import { LoaderCircle } from 'lucide-react';
import { TbMinus, TbPlus } from 'react-icons/tb';
import { Link, useFetcher, useMatches } from 'react-router';
import { Meow } from '~/components/meow';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '~/components/shadcn/ui/avatar';
import { Button } from '~/components/shadcn/ui/button';
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/shadcn/ui/tabs';
import { getUserName } from '~/lib/utils';
import type { Route } from './+types';

export default function User() {
	const routes = useMatches() as Route.ComponentProps['matches'];
	const user = routes[1].data.user;
	const { meows, me, isFollowing } = routes[1].data;
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

	return (
		<div className="w-full mb:px-0 px-4 py-5 transition-all duration-300 ">
			<div className=" inset-shadow-black/10 inset-shadow-sm mb-4">
				<div className="relative mb-1">
					<div
						className="mb-10 h-90 w-full rounded-lg bg-center bg-cover bg-gray-500"
						style={{
							backgroundImage: `url(${user.bannerUrl})`,
						}}
					/>
					<div className="absolute top-2 right-4">
						{me && me.sub === user.sub ? (
							<Link to="/settings/profile">
								<Button className=" rounded-full bg-blue-400 hover:bg-blue-500">
									Edit Profile
								</Button>
							</Link>
						) : isFollowing ? (
							<Button
								variant="destructive"
								className="rounded-full bg-blue-400 hover:bg-blue-500"
								onClick={unfollowHandler}
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
								onClick={followHandler}
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
					<div className="-bottom-8 absolute flex items-center gap-4 whitespace-nowrap text-nowrap px-4">
						<Avatar className="h-32 w-32 shrink-0">
							<AvatarImage src={user?.avatarUrl} />
							<AvatarFallback>{user.name}</AvatarFallback>
						</Avatar>
						{/* // 背景ぼかす */}
						<div className="shrink-9999999 truncate whitespace-nowrap text-nowrap bg-black/10 px-1 text-white [text-shadow:_0_2px_4px_rgba(0,0,0,0.8)]">
							<h1 className="text-2xl truncate max-w-xs">
								{getUserName(user)}
							</h1>
							<p className="text-zinc-100 truncate max-w-xs">@{user.name}</p>
						</div>
					</div>
				</div>
				<div className="px-4">
					<div id="follows" className="flex gap-4">
						<Link to={`/${user.name}/following`}>
							<p>
								<span className="font-semibold">{user._count.following}</span>{' '}
								フォロー
							</p>
						</Link>
						<Link to={`/${user.name}/followers`}>
							<p>
								<span className="font-semibold">{user._count.followers}</span>{' '}
								フォロワー
							</p>
						</Link>
					</div>
				</div>
			</div>
			<div>
				<Tabs defaultValue="meows">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="meows">MEOWS</TabsTrigger>
						<TabsTrigger value="password">ファイル</TabsTrigger>
					</TabsList>
					<TabsContent value="meows">
						<div className="inset-shadow-black/10 inset-shadow-sm rounded-2xl p-5">
							{meows.map((meow) => (
								<div key={meow.id} className="mb-5 border-b py-2">
									<Meow meow={meow} />
								</div>
							))}
						</div>
					</TabsContent>
					<TabsContent value="password">aass</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

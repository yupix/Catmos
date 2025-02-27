import { LoaderCircle } from 'lucide-react';
import { TbMinus, TbPlus } from 'react-icons/tb';
import { Link, data, useFetcher, useLoaderData } from 'react-router';
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
import { getUserSession } from '~/lib/auth/auth.server';
import { prisma } from '~/lib/db';
import { getUserName } from '~/lib/utils';
import type { Route } from './+types/$username';

export async function loader({ params, request }: Route.LoaderArgs) {
	const me = await getUserSession(request);
	const username = params.username;

	// フォロー済みか
	const isFollowing = await prisma.user.findFirst({
		where: {
			sub: me?.sub,
			following: {
				some: {
					name: username,
				},
			},
		},
	});

	const foundUser = await prisma.user.findFirst({
		where: {
			name: username,
			meows: {
				// repliesが無いものだけ取得
				some: {
					replyId: null,
				},
			},
		},
	});

	if (!foundUser) {
		throw data('User not found', { status: 404 });
	}

	const meows = await prisma.meow.findMany({
		where: {
			authorId: foundUser.id,
			// 返信が無いものにしないとMeowコンポーネントで返信が表示されてる都合上、2回表示されるので注意
			replies: {
				none: {},
			},
		},
		include: {
			attachments: {
				include: {
					author: true,
				},
			},
			author: true,
			reply: {
				include: {
					author: true,
					attachments: {
						include: {
							author: true,
						},
					},
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	return { user: foundUser, meows, me, isFollowing: !!isFollowing };
}

export default function User() {
	const { user, meows, me, isFollowing } = useLoaderData<typeof loader>();
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
		<div className="my-20 w-full mb:px-0 px-4 transition-all duration-300 ">
			<div className="relative mb-15">
				<div
					className="h-90 w-full rounded-lg bg-center bg-cover bg-gray-500"
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

				<div className="-bottom-8 absolute flex items-center gap-4 px-4">
					<Avatar className="h-32 w-32">
						<AvatarImage src={user?.avatarUrl} />
						<AvatarFallback>{user.name}</AvatarFallback>
					</Avatar>
					{/* // 背景ぼかす */}
					<div className="truncate text-nowrap whitespace-nowrap bg-black/10 px-1 text-white [text-shadow:_0_2px_4px_rgba(0,0,0,0.8)]">
						<h1 className="text-2xl">{getUserName(user)}</h1>
						<p className="text-zinc-100">@{user.name}</p>
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

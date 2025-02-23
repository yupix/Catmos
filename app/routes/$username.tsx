import { data, useLoaderData } from 'react-router';
import { Meow } from '~/components/meow';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '~/components/shadcn/ui/avatar';
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/shadcn/ui/tabs';
import { prisma } from '~/lib/db';
import type { Route } from './+types/$username';

export async function loader({ params }: Route.LoaderArgs) {
	const username = params.username;
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

	return { user: foundUser, meows };
}

export default function User() {
	const { user, meows } = useLoaderData<typeof loader>();
	return (
		<div className="mx-5 my-20 w-full transition-all duration-300 md:mx-10">
			<div className="relative mb-15">
				<div className="h-90 w-full rounded-lg bg-[url(https://s3.akarinext.org/misskey/*/64ec861a-4b9d-40ad-a49e-45cf6a183190.webp)] bg-center bg-cover" />

				<div className="-bottom-8 absolute flex items-center gap-4 px-4">
					<Avatar className="h-32 w-32">
						<AvatarImage src={user?.avatarUrl} />
						<AvatarFallback>{user.name}</AvatarFallback>
					</Avatar>
					{/* // 背景ぼかす */}
					<div className="bg-black/10 px-1 text-white [text-shadow:_0_2px_4px_rgba(0,0,0,0.8)]">
						<h1 className="text-2xl">{user.name}</h1>
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

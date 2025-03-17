import { parseWithZod } from '@conform-to/zod';
import { TbHome, TbWhirl } from 'react-icons/tb';
import { useLoaderData, useSearchParams } from 'react-router';
import superjson from 'superjson';
import { v4 } from 'uuid';
import { z } from 'zod';
import { MainLayout } from '~/components/layouts/main-layout';
import {} from '~/components/shadcn/ui/avatar';
import { SidebarTrigger } from '~/components/shadcn/ui/sidebar';
import Timeline from '~/components/timeline';
import type { User } from '~/lib/auth/auth.server';
import { getSession } from '~/lib/auth/session.server';
import { MeowIncludes } from '~/lib/const.server';
import { prisma } from '~/lib/db';
import { parseTextToTree } from '~/lib/meow-tree';
import { NotificationService } from '~/lib/notification.server';
import { redisPublisher } from '~/lib/redis.server';
import { cn } from '~/lib/utils';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'New React Router App' },
		{ name: 'description', content: 'Welcome to React Router!' },
	];
}

export async function loader({ request }: Route.LoaderArgs) {
	// 現在のタイムラインのタブを取得
	const searchParams = new URL(request.url).searchParams;
	const nowTab = searchParams.get('tab') ?? 'home';

	const user = await getSession<User>(request);

	if (!user) {
		return { meows: [] };
	}

	const following = await prisma.user.findMany({
		where: {
			followers: {
				some: {
					id: user.id,
				},
			},
		},
	});

	const meows = await prisma.meow.findMany({
		where: {
			author:
				nowTab === 'home'
					? {
							id: {
								in: [...following.map((user) => user.id), user.id],
							},
						}
					: undefined,
		},
		orderBy: {
			createdAt: 'desc',
		},
		include: MeowIncludes(user),
	});

	return { meows };
}

export async function action({ request }: Route.ActionArgs) {
	const me = await getSession<User>(request);

	if (request.method === 'POST') {
		const formData = await request.formData();
		switch (formData.get('intent')) {
			case 'post': {
				const submission = parseWithZod(formData, {
					schema: z
						.object({
							text: z.string().nonempty().optional(),
							replyId: z.string().optional(),
							fileId: z.array(z.string()).optional(),
							remeowId: z.string().optional(),
						})
						.refine(
							(data) =>
								data.remeowId ||
								data.text ||
								(data.fileId && data.fileId.length > 0),
							{
								message: 'textかfileIdのどちらかが必要です',
								path: ['text', 'fileId'],
							},
						),
				});

				if (submission.status !== 'success') {
					return submission.reply();
				}

				const meowTree = parseTextToTree(submission.value.text ?? '');
				const mentions = meowTree
					.map((node) => node.type === 'mention' && node.content?.slice(1))
					.filter(Boolean) as string[];

				const createdMeow = await prisma.meow.create({
					data: {
						text: submission.value.text,
						reply: submission.value.replyId
							? {
									connect: {
										id: submission.value.replyId,
									},
								}
							: undefined,
						author: {
							connect: {
								id: me.id,
							},
						},
						remeow: submission.value.remeowId
							? {
									connect: {
										id: submission.value.remeowId,
									},
								}
							: undefined,
						attachments: {
							connect: submission.value.fileId?.map((id) => ({
								id,
							})),
						},
					},
					include: MeowIncludes(me),
				});

				const mentionedUsers = await prisma.user.findMany({
					select: {
						id: true,
					},
					where: {
						name: {
							in: mentions,
						},
					},
				});

				if (createdMeow.remeowId && createdMeow.remeow) {
					const notificationService = new NotificationService(
						createdMeow.remeow.author.id,
					);
					const createdNotification = await notificationService.notify(
						{
							id: v4(),
							type: 'remeow',
							meowId: createdMeow.id,
							meow: createdMeow,
							userId: createdMeow.remeow.author.id,
							user: createdMeow.author,
						},
						createdMeow.remeow.author.id,
					);

					await redisPublisher.publish(
						'notification',
						superjson.stringify(createdNotification),
					);
				}

				for (const user of mentionedUsers) {
					const notificationService = new NotificationService(user.id);
					const createdNotification = await notificationService.notify(
						{
							id: v4(),
							type: 'mention',
							meowId: createdMeow.id,
							meow: createdMeow,
							userId: user.id,
							user: createdMeow.author,
						},
						user.id,
					);
					await redisPublisher.publish(
						'notification',
						superjson.stringify(createdNotification),
					);
				}

				await redisPublisher.publish('meow', superjson.stringify(createdMeow));
				return createdMeow;
			}
		}
	}
}

export default function Home() {
	const { meows } = useLoaderData<typeof loader>();
	const [searchParams, setSearchParams] = useSearchParams();
	const nowTab = searchParams.get('tab') ?? 'home';

	const Timelines = [
		{
			id: 'home',
			name: 'ホーム',
			icon: TbHome,
		},
		{
			id: 'gb',
			name: 'グローバル',
			icon: TbWhirl,
		},
	];

	const handleTabChange = (tab: string) => () => {
		if (tab !== nowTab) {
			setSearchParams({ tab }, { preventScrollReset: true });
		}
	};

	return (
		<MainLayout
			header={
				<MainLayout.header>
					<div className="flex items-center">
						<SidebarTrigger className="-ml-1 cursor-pointer" />
						<div className="relative mx-auto flex h-12 items-center gap-2">
							{Timelines.map((timeline) => {
								const isActive = timeline.id === nowTab;
								return (
									<button
										type="button"
										key={timeline.id}
										className={cn(
											'relative flex h-full cursor-pointer items-center gap-1 px-2 text-xs',
											isActive
												? 'border-blue-500 border-b-2 text-blue-500'
												: 'text-gray-500',
										)}
										onClick={handleTabChange(timeline.id)}
										onKeyDown={handleTabChange(timeline.id)}
									>
										<timeline.icon className="h-4 w-4" />
										{isActive ? timeline.name : null}
									</button>
								);
							})}
						</div>
					</div>
				</MainLayout.header>
			}
		>
			<Timeline initMeows={meows} />
		</MainLayout>
	);
}

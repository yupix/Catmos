import { parseWithZod } from '@conform-to/zod';
import { useLoaderData } from 'react-router';
import superjson from 'superjson';
import { z } from 'zod';
import {} from '~/components/shadcn/ui/avatar';
import Timeline from '~/components/timeline';
import type { User } from '~/lib/auth/auth.server';
import { getSession } from '~/lib/auth/session.server';
import { MeowIncludes } from '~/lib/const.server';
import { prisma } from '~/lib/db';
import { parseTextToTree } from '~/lib/meow-tree';
import { redisPublisher } from '~/lib/redis.server';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'New React Router App' },
		{ name: 'description', content: 'Welcome to React Router!' },
	];
}

export async function loader({ request }: Route.LoaderArgs) {
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
			author: {
				id: {
					in: [...following.map((user) => user.id), user.id],
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
		include: MeowIncludes(user),
	});

	return { meows: meows };
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
					const createdNotification = await prisma.notification.create({
						data: {
							type: 'remeow',
							userId: createdMeow.remeow.author.id,
							meowId: createdMeow.id,
						},
						include: {
							user: true,
							meow: {
								include: MeowIncludes(me),
							},
						},
					});

					await redisPublisher.publish(
						'notification',
						superjson.stringify(createdNotification),
					);
				}

				for (const user of mentionedUsers) {
					const createdNotification = await prisma.notification.create({
						data: {
							type: 'mention',
							userId: user.id,
							meowId: createdMeow.id,
						},
						include: {
							user: true,
							meow: {
								include: MeowIncludes(me),
							},
						},
					});
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

	return (
		<div className=" w-full p-5">
			<Timeline initMeows={meows} />
		</div>
	);
}

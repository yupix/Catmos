import { parseWithZod } from '@conform-to/zod';
import type { Prisma } from '@prisma/client';
import { TbPencil } from 'react-icons/tb';
import { useLoaderData } from 'react-router';
import superjson from 'superjson';
import { z } from 'zod';
import { PostModal } from '~/components/post-modal';
import {} from '~/components/shadcn/ui/avatar';
import { Button } from '~/components/shadcn/ui/button';
import Timeline from '~/components/timeline';
import { useModal } from '~/hooks/use-modal';
import type { User } from '~/lib/auth/auth.server';
import { getSession } from '~/lib/auth/session.server';
import { prisma } from '~/lib/db';
import { redisPublisher } from '~/lib/redis.server';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'New React Router App' },
		{ name: 'description', content: 'Welcome to React Router!' },
	];
}

export async function loader({ request }: Route.LoaderArgs) {
	const attachmentIncludes: Prisma.FileDefaultArgs = {
		include: {
			author: true,
			Folder: true,
		},
	};
	const meows = await prisma.meow.findMany({
		orderBy: {
			createdAt: 'desc',
		},
		include: {
			attachments: attachmentIncludes,
			author: true,
			reply: {
				include: {
					author: true,
					attachments: attachmentIncludes,
				},
			},
		},
	});
	return { meows };
}

export async function action({ request }: Route.ActionArgs) {
	const user = await getSession<User>(request);
	if (request.method === 'POST') {
		const formData = await request.formData();
		switch (formData.get('intent')) {
			case 'post': {
				const submission = parseWithZod(formData, {
					schema: z.object({
						text: z.string().nonempty(),
						replyId: z.string().optional(),
					}),
				});
				console.log('hello', submission);

				if (submission.status !== 'success') {
					return submission.reply();
				}
				// Do something with the form data
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
								sub: user.sub,
							},
						},
					},
					include: {
						author: true,
						attachments: true,
						reply: {
							include: {
								attachments: {
									include: {
										author: true,
									},
								},
								author: true,
							},
						},
					},
				});

				await redisPublisher.publish('meow', superjson.stringify(createdMeow));
				return createdMeow;
			}
		}
	}
}

export default function Home() {
	const { meows } = useLoaderData<typeof loader>();
	const { openModal, closeModal } = useModal();
	const handleOpenModal = () => {
		openModal(<PostModal closeModal={closeModal} />);
	};

	return (
		<div className=" w-full p-5">
			<div className="relative">
				<div className="fixed right-5 bottom-5 z-10">
					<Button onClick={handleOpenModal} className="cursor-pointer">
						<TbPencil strokeWidth={2} />
					</Button>
				</div>
			</div>
			<Timeline initMeows={meows} />
		</div>
	);
}

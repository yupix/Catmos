import { parseWithZod } from '@conform-to/zod';
import { useLoaderData } from 'react-router';
import { z } from 'zod';
import { PostModal } from '~/components/post-modal';
import {} from '~/components/shadcn/ui/avatar';
import Timeline from '~/components/timeline';
import type { User } from '~/lib/auth/auth.server';
import { getSession } from '~/lib/auth/session.server';
import { prisma } from '~/lib/db';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'New React Router App' },
		{ name: 'description', content: 'Welcome to React Router!' },
	];
}

export function loader({ request }: Route.LoaderArgs) {
	const meows = [
		{
			id: 'koerkgoreigjeijgeo',
			text: 'こんにちは',
			author: {
				id: '1',
				name: 'yupix',
				avatar: 'https://github.com/yupix.png',
			},
			createdAt: new Date(1719757656393),
		},
	];

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
					}),
				});

				if (submission.status !== 'success') {
					return submission.reply();
				}
				// Do something with the form data
				await prisma.meow.create({
					data: {
						text: submission.value.text,
						author: {
							connect: {
								sub: user.sub,
							},
						},
					},
				});
			}
		}
	}
}

export default function Home() {
	const { meows } = useLoaderData<typeof loader>();
	return (
		<div className=" w-full p-5">
			<div className="relative">
				<div className="fixed right-5 bottom-5 z-10">
					<PostModal />
				</div>
			</div>
			<Timeline />
		</div>
	);
}

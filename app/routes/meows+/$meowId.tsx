import { useLoaderData } from 'react-router';
import { Meow } from '~/components/meow';
import { UserCardIncludes } from '~/lib/const.server';
import { prisma } from '~/lib/db';
import type { Route } from './+types/$meowId';

export async function loader({ params }: Route.LoaderArgs) {
	const meow = await prisma.meow.findUnique({
		where: {
			id: params.meowId,
		},
		include: {
			attachments: true,
			author: { include: UserCardIncludes },
			reply: {
				include: {
					attachments: true,
					author: { include: UserCardIncludes },
				},
			},
			remeow: {
				include: {
					attachments: true,
					author: { include: UserCardIncludes },
				},
			},
		},
	});

	if (!meow) {
		throw new Response('Not Found', { status: 404 });
	}

	return { meow };
}

export default function Index() {
	const { meow } = useLoaderData<typeof loader>();

	return (
		<div className="flex w-full items-center justify-center">
			<div className=" inset-shadow-black/10 inset-shadow-sm w-[80%] rounded-2xl p-10">
				<Meow meow={meow} />
			</div>
		</div>
	);
}

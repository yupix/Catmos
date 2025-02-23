import { useLoaderData } from 'react-router';
import { Meow } from '~/components/meow';
import { prisma } from '~/lib/db';
import type { Route } from './+types/$meowId';

export async function loader({ params }: Route.LoaderArgs) {
	const meow = await prisma.meow.findUnique({
		where: {
			id: params.meowId,
		},
		include: {
			attachments: true,
			author: true,
			reply: {
				include: {
					attachments: true,
					author: true,
				},
			},
		},
	});
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

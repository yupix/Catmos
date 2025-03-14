import { useLoaderData } from 'react-router';
import { Meow } from '~/components/meow';
import { getUserSession } from '~/lib/auth/auth.server';
import { MeowIncludes } from '~/lib/const.server';
import { prisma } from '~/lib/db';
import type { Route } from '../+types';

export async function loader({ request, params }: Route.LoaderArgs) {
	const me = await getUserSession(request);

	const meow = await prisma.meow.findUnique({
		where: {
			id: params.meowId,
		},
		include: MeowIncludes(me ?? undefined),
	});

	if (!meow) {
		throw new Response('Not Found', { status: 404 });
	}

	return { meow };
}

export const action = async ({ request, params }: Route.ActionArgs) => {
	const user = await getUserSession(request);

	if (!user) {
		throw new Error('Unauthorized');
	}

	switch (request.method) {
		case 'DELETE': {
			await prisma.meow.delete({
				where: {
					id: params.meowId,
				},
			});
			break;
		}
		default: {
			throw new Error('Method Not Allowed');
		}
	}
};

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

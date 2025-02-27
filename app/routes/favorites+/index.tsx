import { useLoaderData } from 'react-router';
import { Meow } from '~/components/meow';
import { getUserSession } from '~/lib/auth/auth.server';
import { MeowIncludes } from '~/lib/const.server';
import { prisma } from '~/lib/db';
import { cn } from '~/lib/utils';
import type { Route } from '../+types';

export async function loader({ request }: Route.LoaderArgs) {
	const me = await getUserSession(request);
	if (!me) {
		return { status: 302, redirect: '/login' };
	}

	const favorites = await prisma.favorite.findMany({
		where: { userId: me.id },
		include: {
			meow: {
				include: MeowIncludes(me),
			},
		},
		orderBy: { createdAt: 'desc' },
	});
	return { favorites };
}

export default function Index() {
	const { favorites } = useLoaderData<typeof loader>();
	return (
		<div className="inset-shadow-black/10 inset-shadow-sm mt-4 rounded-2xl p-5">
			{favorites?.map((favorite, i) => (
				<div
					key={favorite.meow.id}
					className={cn(
						'my-6 border-b pb-6',
						i === favorites.length - 1 && 'my-0 border-none pb-0',
					)}
				>
					<Meow meow={favorite.meow} />
				</div>
			))}
			{favorites?.length === 0 && <p>No favorites found.</p>}
		</div>
	);
}

import { AnimatePresence, motion } from 'motion/react';
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
			<AnimatePresence>
				{favorites?.map((favorite, i) => (
					<motion.div
						className={cn(
							'my-6 border-b pb-6',
							i === favorites.length - 1 && 'my-0 border-none pb-0',
						)}
						key={favorite.meow.id}
						layout
						initial={{ opacity: 0, y: -20, scale: 0.9 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -20, scale: 0.9 }}
						transition={{ duration: 0.4, ease: 'easeOut' }}
					>
						<Meow meow={favorite.meow} />
					</motion.div>
				))}
			</AnimatePresence>
			{favorites?.length === 0 && (
				<div className="flex flex-col items-center justify-center">
					<img
						src="/mihoyo/no_favorites.webp"
						alt="no favorites"
						className="mb-4 mb-4w-fit rounded-4xl border-2 h-50 w-50"
					/>
					<p>お気に入りはまだありません。</p>
				</div>
			)}
		</div>
	);
}

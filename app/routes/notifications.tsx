import { AnimatePresence, motion } from 'motion/react';
import { useLoaderData } from 'react-router';
import { MainLayout } from '~/components/layouts/main-layout';
import { Notification } from '~/components/notification';
import { SidebarTrigger } from '~/components/shadcn/ui/sidebar';
import { getUserSession } from '~/lib/auth/auth.server';
import { MeowIncludes, UserCardIncludes } from '~/lib/const.server';
import { prisma } from '~/lib/db';
import type { Route } from './+types';

export async function loader({ request }: Route.LoaderArgs) {
	const user = await getUserSession(request);
	if (!user) {
		throw {
			status: 401,
		};
	}

	const notifications = await prisma.notification.findMany({
		where: {
			user: {
				sub: user.sub,
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
		include: {
			user: { include: UserCardIncludes },
			meow: {
				include: MeowIncludes(user),
			},
		},
	});

	return {
		notifications,
	};
}

export default function Notifications() {
	const { notifications } = useLoaderData<typeof loader>();

	return (
		<MainLayout
			header={
				<MainLayout.header>
					<div className="flex items-center">
						<SidebarTrigger className="-ml-1 cursor-pointer" />
						<div className="relative flex h-12 items-center gap-2">通知</div>
					</div>
				</MainLayout.header>
			}
		>
			<AnimatePresence>
				{notifications.map((notification) => (
					<motion.div
						className="my-6 border-b pb-6"
						key={notification.id}
						layout
						initial={{ opacity: 0, y: -20, scale: 0.9 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -20, scale: 0.9 }}
						transition={{ duration: 0.4, ease: 'easeOut' }}
					>
						{' '}
						<Notification notification={notification} />
					</motion.div>
				))}
			</AnimatePresence>
		</MainLayout>
	);
}

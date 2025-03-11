import { AnimatePresence, motion } from 'motion/react';
import { useLoaderData } from 'react-router';
import { MainLayout } from '~/components/layouts/main-layout';
import { Notification } from '~/components/notification';
import { SidebarTrigger } from '~/components/shadcn/ui/sidebar';
import { SpecificImage } from '~/components/specific-image';
import { getUserSession } from '~/lib/auth/auth.server';
import { NotificationService } from '~/lib/notification.server';
import type { Route } from './+types';

export async function loader({ request }: Route.LoaderArgs) {
	const user = await getUserSession(request);
	if (!user) {
		throw {
			status: 401,
		};
	}

	const notifications = await new NotificationService(
		user.id,
	).getNotifications();

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
				{notifications.length > 0 ? (
					notifications.map((notification) => (
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
					))
				) : (
					<div className="flex h-40 flex-col items-center justify-center">
						<SpecificImage
							src="/mihoyo/not_notification.webp"
							alt="通知はありません"
						/>
						<p>通知はありません</p>
					</div>
				)}
			</AnimatePresence>
		</MainLayout>
	);
}

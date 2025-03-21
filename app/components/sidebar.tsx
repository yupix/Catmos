import type { Notification as INotification } from '~/lib/notification.server';
import { Notifications } from './widgets/notifications';

interface SidebarProps {
	notifications: INotification[];
}

export function Sidebar({ notifications }: SidebarProps) {
	return (
		<aside className="h-full w-full border-sidebar-accent border-l bg-sidebar">
			<div className="p-4">
				<Notifications notifications={notifications} />
			</div>
		</aside>
	);
}

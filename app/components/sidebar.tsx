import type { Notification as INotification } from '~/lib/notification.server';
import { Notifications } from './widgets/notifications';

interface SidebarProps {
	notifications: INotification[];
}

export function Sidebar({ notifications }: SidebarProps) {
	return (
		<aside className="h-full w-full border-border border-l bg-background">
			<div className="p-4">
				<Notifications notifications={notifications} />
			</div>
		</aside>
	);
}

import { type INotification, Notifications } from './widgets/notifications';

interface SidebarProps {
	notifications: INotification[];
}

export function Sidebar({ notifications }: SidebarProps) {
	return (
		<aside className="h-full w-full border-gray-200 border-l bg-white">
			<div className="p-4">
				<Notifications notifications={notifications} />
			</div>
		</aside>
	);
}

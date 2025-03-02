import { useEffect, useState } from 'react';
import { TbBell } from 'react-icons/tb';
import { ClientOnly } from 'remix-utils/client-only';
import SuperJSON from 'superjson';
import { type INotification, Notification } from '~/components/notification';
import { socket } from '~/lib/socket.client';
import { cn } from '~/lib/utils';
import { Skeleton } from '../shadcn/ui/skeleton';

interface NotificationProps {
	notifications: INotification[];
}

export function Notifications({ notifications }: NotificationProps) {
	return (
		<ClientOnly
			fallback={
				<Skeleton className="h-[300px] w-full rounded-3xl">
					<Skeleton className="mb-4 h-10 w-full rounded-t-3xl" />
					<Skeleton className="mb-2 flex h-[50px] w-full items-center gap-1 p-2">
						<Skeleton className="h-10 w-10 shrink-0 rounded-full" />
						<div className="flex w-full flex-col gap-2">
							<Skeleton className="h-4 w-[80%]" />
							<Skeleton className="h-4 w-[90%]" />
						</div>
					</Skeleton>
					<Skeleton className="mb-2 flex h-[50px] w-full items-center gap-1 p-2">
						<Skeleton className="h-10 w-10 shrink-0 rounded-full" />
						<div className="flex w-full flex-col gap-2">
							<Skeleton className="h-4 w-[80%]" />
							<Skeleton className="h-4 w-[90%]" />
						</div>
					</Skeleton>
				</Skeleton>
			}
		>
			{() => <Clint notifications={notifications} />}
		</ClientOnly>
	);
}

/**
 * Clintコンポーネント
 * @returns {JSX.Element} 通知の詳細スケルトンローディングコンポーネント
 */
function Clint({ notifications }: NotificationProps) {
	const [notificationsState, setNotifications] =
		useState<INotification[]>(notifications);
	const [isConnected, setIsConnected] = useState(socket.connected);

	useEffect(() => {
		const handleConnect = () => {
			console.log('connected');
			setIsConnected(true);
		};

		const handleDisconnect = () => {
			setIsConnected(false);
		};

		const handleMessage = (_notification: string) => {
			const audio = new Audio('/bell.mp3');
			audio.play();
			const notification = SuperJSON.parse<INotification>(_notification);
			setNotifications((prev) => [notification, ...prev]);
		};

		socket.on('connect', handleConnect);
		socket.on('disconnect', handleDisconnect);
		socket.on('notification', handleMessage);

		return () => {
			socket.off('connect', handleConnect);
			socket.off('disconnect', handleDisconnect);
			socket.off('notification', handleMessage);
		};
	}, []);

	return (
		<div className=" inset-shadow-black/20 inset-shadow-sm w-full rounded-3xl">
			<div className="sticky top-0 z-10 mb-4 flex h-10 w-full items-center rounded-t-3xl bg-gray-200 pl-3">
				<h1 className="flex items-center gap-1 text-gray-500">
					<TbBell className="h-5 w-5" />
					<span className="text-sm">通知</span>
				</h1>
			</div>
			<div className="max-h-[300px] overflow-y-scroll">
				{notificationsState.length === 0 && (
					<div className="flex h-40 flex-col items-center justify-center">
						<img
							src="/mihoyo/not_notification.webp"
							alt="通知はありません"
							className="mb-4 h-30 w-30 rounded-xl"
						/>
						<p>通知はありません</p>
					</div>
				)}
				{notificationsState.map((notification, i) => (
					<div
						key={notification.id}
						className={cn(
							i < notifications.length - 1 ? 'border-b pb-2' : 'py-2',
						)}
					>
						<Notification notification={notification} />
					</div>
				))}
			</div>
		</div>
	);
}

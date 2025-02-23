import type { Meow as MeowModel, User } from '@prisma/client';
import { useEffect, useState } from 'react';
import { TbBell } from 'react-icons/tb';
import { ClientOnly } from 'remix-utils/client-only';
import SuperJSON from 'superjson';
import { socket } from '~/lib/socket.client';
import { cn } from '~/lib/utils';
import { Meow } from '../meow';
import { Avatar, AvatarFallback, AvatarImage } from '../shadcn/ui/avatar';
import { Skeleton } from '../shadcn/ui/skeleton';

export interface INotification {
	id: string;
	type: 'reaction' | 'reply' | 'mention' | 'remeow';
	meow?: MeowModel & {
		author: User;
	};
	user: User;
	createdAt: Date;
}

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
	const notificationIcon = (type: INotification['type']) => {
		switch (type) {
			case 'reaction':
				return <TbBell className="h-5 w-5" />;
			case 'reply':
				return <TbBell className="h-5 w-5" />;
			default:
				return <TbBell className="h-5 w-5" />;
		}
	};

	useEffect(() => {
		const handleConnect = () => {
			console.log('connected');
			setIsConnected(true);
		};

		const handleDisconnect = () => {
			setIsConnected(false);
		};

		const handleMessage = (_notification: string) => {
			console.log(_notification);
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
		<div className=" w-full rounded-3xl inset-shadow-sm inset-shadow-black/20">
			<div className="mb-4 h-10 w-full rounded-t-3xl bg-gray-200 flex items-center pl-3 sticky top-0 z-10">
				<h1 className="flex items-center gap-1 text-gray-500">
					<TbBell className="h-5 w-5" />
					<span className="text-sm">通知</span>
				</h1>
			</div>
			<div className="max-h-[300px] overflow-y-scroll">
				{notificationsState.map((notification, i) => (
					<div
						key={notification.id}
						className={cn(
							i < notifications.length - 1 ? 'border-b pb-2' : 'py-2',
						)}
					>
						{notification.meow ? (
							<div>
								<Meow meow={notification.meow} isSmall />
							</div>
						) : (
							<div className="mb-2 flex w-full items-center gap-2 p-2">
								<div className="relative shrink-0">
									<Avatar className="h-12 w-12">
										<AvatarImage
											src={notification.user.avatarUrl}
											alt="avatar"
											className=""
										/>
										<AvatarFallback>{notification.user.name}</AvatarFallback>
									</Avatar>
									<div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
										{notificationIcon(notification.type)}
									</div>
								</div>

								<div className="flex w-full flex-col gap-2">
									<span className="text-sm">
										{notification.type === 'reaction' && (
											<>
												<span className="text-blue-500 font-bold">
													{notification.user.name}
												</span>
												<span>さんがあなたの鳴き声にリアクションしました</span>
											</>
										)}
										{notification.type === 'remeow' && (
											<>
												<span className="text-blue-500 font-bold">
													{notification.user.name}
												</span>
												<span>さんがあなたの鳴き声をリメウしました</span>
											</>
										)}
									</span>
									<span className="text-xs text-gray-500">
										{notification.createdAt.toLocaleString()}
									</span>
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

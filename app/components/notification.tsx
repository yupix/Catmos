import type { Meow as MeowModel, User } from '@prisma/client';
import { TbBell } from 'react-icons/tb';
import { Meow } from './meow';
import { Avatar, AvatarFallback, AvatarImage } from './shadcn/ui/avatar';

interface NotificationProps {
	notification: INotification;
}

export interface INotification {
	id: string;
	type: 'reaction' | 'reply' | 'mention' | 'remeow';
	meow?: MeowModel & {
		author: User;
	};
	user: User;
	createdAt: Date;
}

export function Notification({ notification }: NotificationProps) {
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

	return (
		<>
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
						<div className="-bottom-1 -right-1 absolute rounded-full bg-white p-0.5">
							{notificationIcon(notification.type)}
						</div>
					</div>

					<div className="flex w-full flex-col gap-2">
						<span className="text-sm">
							{notification.type === 'reaction' && (
								<>
									<span className="font-bold text-blue-500">
										{notification.user.name}
									</span>
									<span>さんがあなたの鳴き声にリアクションしました</span>
								</>
							)}
							{notification.type === 'remeow' && (
								<>
									<span className="font-bold text-blue-500">
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
		</>
	);
}

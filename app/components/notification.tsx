import type {
	File as FileModel,
	Meow as MeowModel,
	User,
} from '@prisma/client';
import { TbBell, TbPlus } from 'react-icons/tb';
import type { BaseNotification } from '~/lib/notification.server';
import { getUserName } from '~/lib/utils';
import { HoverUserCard } from './hover-user-card';
import { Meow } from './meow';
import { TimeDisplay } from './meow/time';
import { Avatar, AvatarFallback, AvatarImage } from './shadcn/ui/avatar';

interface NotificationProps {
	notification: INotification;
}

export interface INotification {
	id: string;
	type: BaseNotification['type'];
	meow?: MeowModel & {
		author: User;
		attachments: FileModel[];
		reply: MeowModel & {
			attachments: FileModel[];
			author: User;
		};
		remeow: MeowModel & {
			attachments: FileModel[];
			author: User;
		};
	};
	user: User;
	createdAt: Date;
}

export function Notification({ notification }: NotificationProps) {
	const notificationIcon = (type: BaseNotification['type']) => {
		switch (type) {
			case 'reaction':
				return <TbBell className="h-5 w-5" />;
			case 'follow':
				return <TbPlus className="h-5 w-5 text-blue-500" />;
			case 'mention':
				return <TbBell className="h-5 w-5" />;
			default:
				return <TbBell className="h-5 w-5" />;
		}
	};

	return (
		<>
			{notification.meow ? (
				<div>
					<Meow meow={notification.meow} size="xs" isCompactFile />
				</div>
			) : (
				<div className="mb-2 flex w-full items-center gap-2 px-4 py-2">
					<div className="flex w-full items-center gap-2">
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

						<div className="flex w-full flex-col gap-0 text-xs ">
							<div className="w-full overflow-hidden">
								<div className="flex justify-between">
									<HoverUserCard
										user={notification.user}
										className="shrink-999999 overflow-hidden overflow-ellipsis whitespace-nowrap"
									>
										{getUserName(notification.user, true)}
									</HoverUserCard>

									<div className="shrink-0">
										<TimeDisplay date={notification.createdAt} />
									</div>
								</div>
								<p className="text-slate-600 text-xs">
									{notification.type === 'follow' && (
										<span>フォローされました</span>
									)}
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
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

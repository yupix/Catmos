import SuperJSON from 'superjson';
import type { IMeow, IUserCard } from './const.server';
import { redis } from './redis.server';

export interface BaseNotification {
	id: string;
	type: 'follow' | 'remeow' | 'reaction' | 'mention';
	createdAt?: Date;
}

interface MentionNotification extends BaseNotification {
	userId: string;
	user: IUserCard; // 通知を送信したユーザー
	meowId: string;
	meow: IMeow;
	type: 'mention';
}

interface FollowNotification extends BaseNotification {
	userId: string;
	user: IUserCard; // 通知を送信したユーザー
	type: 'follow';
}

interface RemeowNotification extends BaseNotification {
	userId: string;
	user: IUserCard; // 通知を送信したユーザー
	meowId: string;
	meow: IMeow;
	type: 'remeow';
}

export type Notification =
	| FollowNotification
	| RemeowNotification
	| MentionNotification;

export class NotificationService {
	private userId: string;
	private notifications: Notification[] = [];

	constructor(userId: string) {
		this.userId = userId;
	}

	async notify(
		notification: Notification,
		targetId?: string,
	): Promise<Notification & { targetId?: string; createdAt: Date }> {
		const createdAt = new Date();
		await this.getNotifications();
		this.notifications.push({ ...notification, createdAt });

		this.saveNotifications();

		return { ...notification, targetId, createdAt };
	}

	async getNotifications() {
		const notificationsData = await redis.get(`notifications:${this.userId}`);
		this.notifications = notificationsData
			? SuperJSON.parse(notificationsData)
			: [];
		return this.notifications.reverse();
	}

	private saveNotifications(): void {
		redis.set(
			`notifications:${this.userId}`,
			SuperJSON.stringify(this.notifications),
		);
	}
}

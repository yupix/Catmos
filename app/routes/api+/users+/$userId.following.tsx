import type { User } from '@prisma/client';
import { data } from 'react-router';
import SuperJSON from 'superjson';
import { v4 } from 'uuid';
import { getUserSession } from '~/lib/auth/auth.server';
import { type IUserCard, UserCardIncludes } from '~/lib/const.server';
import { prisma } from '~/lib/db';
import { NotificationService } from '~/lib/notification.server';
import { redisPublisher } from '~/lib/redis.server';
import type { Route } from '../../+types';

export async function loader() {
	return null;
}

export async function action({ request, params }: Route.ActionArgs) {
	async function createFollowing(me: IUserCard, targetUser: User) {
		await prisma.user.update({
			where: {
				sub: me.sub,
			},
			data: {
				following: {
					connect: {
						id: targetUser.id,
					},
				},
			},
		});

		const notificationService = new NotificationService(targetUser.id);
		const createdNotification = await notificationService.notify(
			{
				id: v4(),
				type: 'follow',
				userId: me.id,
				user: me,
			},
			targetUser.id,
		);

		await redisPublisher.publish(
			'notification',
			SuperJSON.stringify(createdNotification),
		);
	}

	async function deleteFollowing(me: IUserCard, targetUser: User) {
		await prisma.user.update({
			where: {
				sub: me.sub,
			},
			data: {
				following: {
					disconnect: {
						id: targetUser.id,
					},
				},
			},
		});
	}

	const me = await getUserSession(request);

	const userId = params.userId;

	// 未認証
	if (!me) {
		return { status: 401 };
	}

	const user = await prisma.user.findFirst({
		where: {
			id: me.id,
		},
		include: UserCardIncludes,
	});

	if (!user) {
		return { status: 404 };
	}

	const targetUser = await prisma.user.findFirst({
		where: {
			id: userId,
		},
	});

	if (!targetUser) {
		return { status: 404 };
	}

	// 自分自身をフォローしようとしている
	if (targetUser.sub === me.sub) {
		return { status: 400 };
	}

	switch (request.method) {
		case 'POST':
			await createFollowing(user, targetUser);
			return data({ status: 201 });
		case 'DELETE':
			await deleteFollowing(user, targetUser);
			return data({ status: 204 });
		default:
			return { status: 405 };
	}
}

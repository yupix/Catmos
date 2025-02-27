import type { User } from '@prisma/client';
import { data } from 'react-router';
import type { User as IUser } from '~/lib/auth/auth.server';
import { getUserSession } from '~/lib/auth/auth.server';
import { prisma } from '~/lib/db';
import type { Route } from '../../+types';

export async function loader() {
	return null;
}

export async function action({ request, params }: Route.ActionArgs) {
	async function createFollowing(me: IUser, targetUser: User) {
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
	}

	async function deleteFollowing(me: IUser, targetUser: User) {
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
	console.log(params.userId, 'うんこ');

	// 未認証
	if (!me) {
		return { status: 401 };
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
			await createFollowing(me, targetUser);
			return data({ status: 201 });
		case 'DELETE':
			await deleteFollowing(me, targetUser);
			return data({ status: 204 });
		default:
			return { status: 405 };
	}
}

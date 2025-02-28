import { data } from 'react-router';
import { getUserSession } from '~/lib/auth/auth.server';
import { UserCardIncludes } from '~/lib/const.server';
import { prisma } from '~/lib/db';
import type { Route } from '../+types';

export async function loader({ params, request }: Route.LoaderArgs) {
	const me = await getUserSession(request);
	const username = params.username;

	// フォロー済みか
	const isFollowing = await prisma.user.findFirst({
		where: {
			sub: me?.sub,
			following: {
				some: {
					name: username,
				},
			},
		},
	});

	const foundUser = await prisma.user.findFirst({
		where: {
			name: username,
			meows: {
				// repliesが無いものだけ取得
				some: {
					replyId: null,
				},
			},
		},
		include: UserCardIncludes,
	});

	if (!foundUser) {
		throw data('User not found', { status: 404 });
	}

	const meows = await prisma.meow.findMany({
		where: {
			authorId: foundUser.id,
			// 返信が無いものにしないとMeowコンポーネントで返信が表示されてる都合上、2回表示されるので注意
			replies: {
				none: {},
			},
		},
		include: {
			attachments: {
				include: {
					author: { include: UserCardIncludes },
				},
			},
			author: { include: UserCardIncludes },
			reply: {
				include: {
					author: { include: UserCardIncludes },
					attachments: {
						include: {
							author: { include: UserCardIncludes },
						},
					},
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	return { user: foundUser, meows, me, isFollowing: !!isFollowing };
}

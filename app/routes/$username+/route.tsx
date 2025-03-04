import { Outlet, data } from 'react-router';
import { UserLayout } from '~/components/layouts/user-layout';
import { SidebarTrigger } from '~/components/shadcn/ui/sidebar';
import { getUserSession } from '~/lib/auth/auth.server';
import { MeowIncludes, UserCardIncludes } from '~/lib/const.server';
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
		include: MeowIncludes(me ?? undefined),
		orderBy: {
			createdAt: 'desc',
		},
	});

	return { user: foundUser, meows, me, isFollowing: !!isFollowing };
}

export default function Layout() {
	return (
		<UserLayout
			header={
				<UserLayout.header>
					<div className="flex items-center">
						<SidebarTrigger className="-ml-1 cursor-pointer" />
					</div>
				</UserLayout.header>
			}
		>
			<Outlet />
		</UserLayout>
	);
}

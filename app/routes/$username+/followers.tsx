import { useLoaderData } from 'react-router';
import { ProfileCard } from '~/components/profile-card';
import { getUserSession } from '~/lib/auth/auth.server';
import { UserCardIncludes } from '~/lib/const.server';
import { prisma } from '~/lib/db';
import type { Route } from './+types/route';

export async function loader({ params, request }: Route.LoaderArgs) {
	const username = params.username;

	const me = await getUserSession(request);

	const followers = await prisma.user.findFirst({
		where: {
			name: username,
		},
		include: {
			followers: {
				include: UserCardIncludes,
			},
		},
	});

	return { followers: followers?.followers || [], me };
}

export default function Index() {
	const { followers, me } = useLoaderData<typeof loader>();

	return (
		<div className="p-5 @container">
			<h1 className="text-2xl font-semibold">Followers</h1>
			<div className="grid grid-cols-1 gap-1 @min-[600px]:grid-cols-3">
				{followers.map((follower) => (
					<div key={follower.id} className="my-2 shrink-0 w-full">
						<ProfileCard me={me} user={follower} />
					</div>
				))}
			</div>
		</div>
	);
}

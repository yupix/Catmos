import { useLoaderData } from 'react-router';
import { Notification } from '~/components/notification';
import { getUserSession } from '~/lib/auth/auth.server';
import { MeowIncludes } from '~/lib/const.server';
import { prisma } from '~/lib/db';
import type { Route } from './+types';

export async function loader({ request }: Route.LoaderArgs) {
	const user = await getUserSession(request);
	if (!user) {
		throw {
			status: 401,
		};
	}

	const notifications = await prisma.notification.findMany({
		where: {
			user: {
				sub: user.sub,
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
		include: {
			user: true,
			meow: {
				include: MeowIncludes(user),
			},
		},
	});

	return {
		notifications,
	};
}

export default function Notifications() {
	const { notifications } = useLoaderData<typeof loader>();

	return (
		<div>
			{notifications.map((notification) => (
				<div key={notification.id}>
					<Notification notification={notification} />
				</div>
			))}
		</div>
	);
}

import { createLoader, parseAsString } from 'nuqs/server';
import { data } from 'react-router';
import { getUserSession } from '~/lib/auth/auth.server';
import { UserCardIncludes } from '~/lib/const.server';
import { prisma } from '~/lib/db';
import type { Route } from './+types/reactions';

export const loadSearchParams = createLoader({
	reaction: parseAsString.withDefault(''),
});

export const loader = async ({ params, request }: Route.LoaderArgs) => {
	const { meowId } = params;
	const me = await getUserSession(request);
	const { reaction } = loadSearchParams(request);

	if (!me) {
		throw new Response(null, { status: 401 });
	}

	const reactions = await prisma.meowReaction.findMany({
		where: {
			meowId,
			reaction,
		},
		include: {
			user: {
				include: UserCardIncludes,
			},
		},
	});

	return data(
		{ reactions, reaction },
		{
			headers: {
				'Cache-Control': 'public, max-age=60',
				'Content-Type': 'application/json',
			},
		},
	);
};

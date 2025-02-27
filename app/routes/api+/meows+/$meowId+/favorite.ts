import { getUserSession } from '~/lib/auth/auth.server';
import { prisma } from '~/lib/db';
import type { Route } from './+types/favorite';

export async function action({ params, request }: Route.ActionArgs) {
	const me = await getUserSession(request);
	if (!me) {
		return new Response(null, { status: 401 });
	}

	const targetMeowId = params.meowId;

	switch (request.method) {
		case 'POST': {
			await prisma.favorite.create({
				data: {
					userId: me.id,
					meowId: targetMeowId,
				},
			});
			return new Response(null, { status: 204 });
		}
		case 'DELETE': {
			await prisma.favorite.delete({
				where: {
					unique_meow_user: {
						meowId: targetMeowId,
						userId: me.id,
					},
				},
			});
			return new Response(null, { status: 204 });
		}
	}
}

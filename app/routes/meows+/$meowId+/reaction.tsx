import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';
import { getUserSession } from '~/lib/auth/auth.server';
import { prisma } from '~/lib/db';
import type { Route } from '../+types';

const createSchema = z.object({
	reaction: z.string().nonempty(),
});

export const action = async ({ request, params }: Route.ActionArgs) => {
	const { meowId } = params;

	if (meowId === undefined) {
		throw new Response('Not Found', { status: 404 });
	}

	const me = await getUserSession(request);

	if (!me) throw new Response('Not Authorized', { status: 401 });

	switch (request.method) {
		case 'POST': {
			const formData = await request.formData();
			const submission = parseWithZod(formData, { schema: createSchema });

			if (submission.status !== 'success') {
				return {
					lastResult: submission.reply(),
					result: null,
				};
			}

			await prisma.meowReaction.create({
				data: {
					meowId: meowId,
					userId: me.id,
					reaction: submission.value.reaction,
				},
			});
			return {
				lastResult: submission.reply(),
				result: null,
			};
		}

		case 'DELETE': {
			const { meowId } = params;

			if (meowId === undefined) {
				throw new Response('Not Found', { status: 404 });
			}

			const me = await getUserSession(request);

			if (!me) throw new Response('Not Authorized', { status: 401 });

			await prisma.meowReaction.deleteMany({
				where: {
					meowId: meowId,
					userId: me.id,
				},
			});

			return new Response('Reaction deleted', { status: 200 });
		}
	}
};

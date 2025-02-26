import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';
import { getUserSession } from '~/lib/auth/auth.server';
import { prisma } from '~/lib/db';
import type { Route } from '../+types';

export async function action({ request }: Route.ActionArgs) {
	const user = await getUserSession(request);

	if (!user) {
		throw new Error('Unauthorized');
	}

	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema: z.object({
			meowId: z.string(),
		}),
	});

	if (submission.status !== 'success') {
		return submission.reply();
	}

	await prisma.meow.delete({
		where: {
			id: submission.value.meowId,
		},
	});

	return { success: true };
}

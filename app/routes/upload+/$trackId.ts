import { data } from 'react-router';
import { getUserSession } from '~/lib/auth/auth.server';
import { multipartUploader } from '~/lib/uploader';
import type { Route } from '../+types';

export async function action({ request }: Route.ActionArgs) {
	const user = await getUserSession(request);

	if (!user) {
		throw data('Not Authorized', { status: 401 });
	}

	const form = await multipartUploader({ request, user });

	return form.getAll('files').map((file) => JSON.parse(file.toString()));
}

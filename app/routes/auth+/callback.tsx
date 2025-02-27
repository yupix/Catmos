import { type LoaderFunctionArgs, redirect } from 'react-router';
import { getUserSession } from '~/lib/auth/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
	try {
		const user = await getUserSession(request);
		if (user) {
			throw redirect('/');
		}
	} catch (e) {
		if (e instanceof Response) {
			throw e;
		}
		console.error(e);
		redirect('/');
	}
}

export default function Calback() {
	return <></>;
}

import type { LoaderFunctionArgs } from 'react-router';
import { authenticator } from '~/lib/auth/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
	return await authenticator.authenticate('zitadel', request);
}

export default function Login() {
	return <></>;
}

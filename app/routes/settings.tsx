import type { User } from '~/lib/auth/auth.server';
import { getSession } from '~/lib/auth/session.server';
import type { Route } from './+types/settings';

export async function loader({ request }: Route.LoaderArgs) {
	const user = await getSession<User>(request);
	return { user };
}

export default function Index() {
	return <div>Settings</div>;
}

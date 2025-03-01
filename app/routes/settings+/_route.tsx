import { Outlet, redirect } from 'react-router';
import { MainLayout } from '~/components/layouts/main-layout';
import type { Route } from '../+types';

export function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);

	// レイアウト用のルートなので、/settingsにアクセスされたら/profileにリダイレクト
	if (url.pathname === '/settings') {
		return redirect('/settings/profile', { status: 302 });
	}
	return null;
}

export default function Layout() {
	return (
		<MainLayout>
			<Outlet />
		</MainLayout>
	);
}

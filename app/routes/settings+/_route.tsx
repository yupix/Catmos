import { Outlet, redirect } from 'react-router';
import { MainLayout } from '~/components/layouts/main-layout';
import { SidebarTrigger } from '~/components/shadcn/ui/sidebar';
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
		<MainLayout
			header={
				<MainLayout.header>
					<div className="flex items-center">
						<SidebarTrigger className="-ml-1 cursor-pointer" />
						<div className="relative flex h-12 items-center gap-2">設定</div>
					</div>
				</MainLayout.header>
			}
		>
			<Outlet />
		</MainLayout>
	);
}

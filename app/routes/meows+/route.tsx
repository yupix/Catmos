import { Outlet } from 'react-router';
import { MainLayout } from '~/components/layouts/main-layout';
import { SidebarTrigger } from '~/components/shadcn/ui/sidebar';

export default function Layout() {
	return (
		<MainLayout
			header={
				<MainLayout.header>
					<div className="flex items-center">
						<SidebarTrigger className="-ml-1 cursor-pointer" />
					</div>
				</MainLayout.header>
			}
		>
			<Outlet />
		</MainLayout>
	);
}

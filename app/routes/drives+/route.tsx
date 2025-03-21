import { Outlet } from 'react-router';
import { MainLayout } from '~/components/layouts/main-layout';
import { SidebarTrigger } from '~/components/shadcn/ui/sidebar';

export default function Index() {
	return (
		<MainLayout
			header={
				<MainLayout.header>
					<div className="flex items-center">
						<SidebarTrigger className="-ml-1 cursor-pointer" />
						<div className="relative flex h-12 items-center gap-2">
							ドライブ
						</div>
					</div>
				</MainLayout.header>
			}
		>
			<Outlet />
		</MainLayout>
	);
}

import { Outlet } from 'react-router';
import { MainLayout } from '~/components/layouts/main-layout';

export default function Index() {
	return (
		<MainLayout>
			<Outlet />
		</MainLayout>
	);
}

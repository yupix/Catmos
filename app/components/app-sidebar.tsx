import { TbBell, TbHome } from 'react-icons/tb';
import { Link, useLocation } from 'react-router';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '~/components/shadcn/ui/sidebar';
import { NavUser } from './nav-user';

const MENUS = [
	[
		{
			to: '/',
			icon: TbHome,
			text: 'タイムライン',
		},
		{
			to: '/notifications',
			icon: TbBell,
			text: '通知',
		},
	],
];

export interface AppSidebarProps {
	user: {
		name: string;
		avatar: string | null;
	};
}

export function AppSidebar({ user }: AppSidebarProps) {
	const location = useLocation();
	const activeClass =
		'bg-sky-600 text-white transition-all hover:bg-sky-600/90 hover:text-white';

	return (
		<Sidebar>
			<SidebarHeader />
			<SidebarContent>
				{MENUS.map((group, i) => {
					return (
						<SidebarGroup key={i}>
							<SidebarContent>
								<SidebarMenu>
									{group.map((menu, i) => {
										const Icon = menu.icon;
										const isActive = location.pathname === menu.to;
										const className = isActive ? activeClass : '';

										return (
											<SidebarMenuItem key={i}>
												<SidebarMenuButton asChild className={className}>
													<Link to={menu.to}>
														<Icon stroke={2} />
														{menu.text}
													</Link>
												</SidebarMenuButton>
											</SidebarMenuItem>
										);
									})}
								</SidebarMenu>
							</SidebarContent>
						</SidebarGroup>
					);
				})}
			</SidebarContent>
			<SidebarFooter>
				<NavUser
					user={{
						avatar: user.avatar,
						name: user.name,
					}}
				/>
			</SidebarFooter>
		</Sidebar>
	);
}

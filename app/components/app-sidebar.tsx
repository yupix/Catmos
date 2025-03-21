import { TbBell, TbCloud, TbHeart, TbHome, TbSettings } from 'react-icons/tb';
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
	useSidebar,
} from '~/components/shadcn/ui/sidebar';
import type { User } from '~/lib/auth/auth.server';
import { cn } from '~/lib/utils';
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
		{
			to: '/drives',
			icon: TbCloud,
			text: 'ドライブ',
		},
		{
			to: '/favorites',
			icon: TbHeart,
			text: 'お気に入り',
		},
	],
	[
		{
			to: '/settings/profile',
			icon: TbSettings,
			text: '設定',
		},
		// {
		// 	to: '/admin/emojis',
		// 	icon: TbMoodHappy,
		// 	text: '絵文字',
		// },
	],
];

export interface AppSidebarProps {
	user: User;
}

export function AppSidebar({ user }: AppSidebarProps) {
	const sidebar = useSidebar();
	const location = useLocation();
	const activeClass =
		'text-sky-700 dark:text-sky-500 hover:text-sky-700 dark:hover:text-sky-400 transition-all bg-sky-600/30 dark:bg-sky-400/20 dark:hover:bg-sky-400/30';

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader />
			<SidebarContent>
				<SidebarGroup className="mb-5">
					<SidebarContent>
						<SidebarMenu>
							<SidebarMenuItem className="flex justify-center">
								<img src="/logo.png" alt="logo" className="h-14 w-14" />
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarContent>
				</SidebarGroup>
				{MENUS.map((group, i) => {
					return (
						<>
							<SidebarGroup key={i}>
								<SidebarContent>
									<SidebarMenu>
										{group.map((menu, i) => {
											const Icon = menu.icon;
											const isActive = location.pathname === menu.to;
											const className = isActive
												? activeClass
												: 'hover:text-sky-700 dark:hover:text-sky-500 transition-all hover:bg-sky-600/30 dark:hover:bg-sky-400/30';

											return (
												<SidebarMenuItem key={i}>
													<SidebarMenuButton
														asChild
														className={cn(
															className,
															'h-10 rounded-full px-4 text-lg',
														)}
													>
														<Link
															to={menu.to}
															onClick={() => sidebar.setOpenMobile(false)}
														>
															<Icon strokeWidth={2} />
															{menu.text}
														</Link>
													</SidebarMenuButton>
												</SidebarMenuItem>
											);
										})}
									</SidebarMenu>
								</SidebarContent>
							</SidebarGroup>
							{MENUS.length - 1 !== i ? (
								<div className="mx-2 border-b" />
							) : null}
						</>
					);
				})}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}

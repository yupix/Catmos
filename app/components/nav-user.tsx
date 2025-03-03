import { BadgeCheck, ChevronsUpDown, LogOut } from 'lucide-react';
import { TbSettings } from 'react-icons/tb';
import { Link } from 'react-router';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '~/components/shadcn/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/shadcn/ui/dropdown-menu';
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '~/components/shadcn/ui/sidebar';
import type { User } from '~/lib/auth/auth.server';
import { getUserName } from '~/lib/utils';
export function NavUser({
	user,
}: {
	user: User;
}) {
	const { isMobile, setOpenMobile } = useSidebar();
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={user.avatarUrl} alt={user.name} />
								<AvatarFallback className="rounded-lg">
									{user.name}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user.name}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? 'bottom' : 'right'}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src={user.avatarUrl} alt={user.name} />
									<AvatarFallback className="rounded-lg">
										{user.name}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{getUserName(user)}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link to={`/${user.name}`} onClick={() => setOpenMobile(false)}>
									<BadgeCheck />
									プロフィール
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link
									to="/settings/profile"
									onClick={() => setOpenMobile(false)}
								>
									<TbSettings />
									設定
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="text-red-400 hover:text-red-500">
							<LogOut color="oklch(0.704 0.191 22.216)" />
							ログアウト
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

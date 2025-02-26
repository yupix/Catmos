import type { User } from '@prisma/client';
import { Link } from 'react-router';
import { getUserName } from '~/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './shadcn/ui/avatar';
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from './shadcn/ui/hover-card';

interface HoverUserCardProps {
	children: React.ReactNode;
	user: User;
}

export function HoverUserCard({ children, user }: HoverUserCardProps) {
	return (
		<HoverCard>
			<HoverCardTrigger className="h-fit">{children}</HoverCardTrigger>
			<Link to={user.name}>
				<HoverCardContent className="w-80 cursor-pointer">
					<div className="flex space-x-4">
						<Avatar className="h-15 w-15">
							<AvatarImage src={user.avatarUrl} />
							<AvatarFallback>{user.name}</AvatarFallback>
						</Avatar>
						<div className="space-y-1">
							<h4 className="font-semibold text-sm max-w-[200px] truncate">
								{getUserName(user, true)}
							</h4>
							<p className="text-sm">{/* BIO */}</p>
							<div className="flex items-center pt-2">
								{/* <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{' '} */}
								<span className="text-xs text-muted-foreground">
									Joined December {user.createdAt.getFullYear()}
								</span>
							</div>
						</div>
					</div>
				</HoverCardContent>
			</Link>
		</HoverCard>
	);
}

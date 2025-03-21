import type { User } from '@prisma/client';
import { Link, useMatches } from 'react-router';
import { cn } from '~/lib/utils';
import type { Route } from '../+types/root';
import { ProfileCard } from './profile-card';
import {} from './shadcn/ui/avatar';
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from './shadcn/ui/hover-card';

interface HoverUserCardProps {
	children: React.ReactNode;
	user: User;
	className?: string;
}

export function HoverUserCard({
	children,
	user,
	className,
}: HoverUserCardProps) {
	const routes = useMatches() as Route.ComponentProps['matches'];
	const me = routes[0].data.user;

	return (
		<HoverCard>
			<HoverCardTrigger className={cn('h-fit', className)} asChild>
				{children}
			</HoverCardTrigger>
			<Link to={user.name}>
				<HoverCardContent className="w-80 cursor-pointer p-0 m-0">
					<ProfileCard user={user} me={me} />
				</HoverCardContent>
			</Link>
		</HoverCard>
	);
}

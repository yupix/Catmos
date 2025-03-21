import { Link } from 'react-router';
import type { IMeow } from '~/lib/const.server';
import { HoverUserCard } from '../hover-user-card';
import { TimeDisplay } from './time';

interface MeowHeaderProps {
	meow: IMeow;
}

export const MeowHeader = ({ meow }: MeowHeaderProps) => {
	return (
		<div className="flex justify-between text-sm">
			<HoverUserCard
				user={meow.author}
				className="shrink-999999 overflow-hidden overflow-ellipsis whitespace-nowrap"
			>
				<div className="flex">
					<span className="font-semibold">
						{meow.author.displayName || meow.author.name}
					</span>
					<span className="text-accent-foreground/80">
						{meow.author.displayName ? `@${meow.author.name}` : null}
					</span>
				</div>
			</HoverUserCard>

			<div className="shrink-0">
				<Link to={`/meows/${meow.id}`}>
					<TimeDisplay date={meow.createdAt} />
				</Link>
			</div>
		</div>
	);
};

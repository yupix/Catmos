import type { IMeow } from '~/lib/const.server';
import { HoverUserCard } from '../hover-user-card';
import { TimeDisplay } from './time';

interface MeowHeaderProps {
	meow: IMeow;
}

export const MeowHeader = ({ meow }: MeowHeaderProps) => {
	return (
		<div className="flex justify-between">
			<HoverUserCard
				user={meow.author}
				className="shrink-999999 overflow-hidden overflow-ellipsis whitespace-nowrap"
			>
				{meow.author.displayName || meow.author.name}
				{meow.author.displayName ? `@${meow.author.name}` : null}
			</HoverUserCard>

			<div className="shrink-0">
				<TimeDisplay date={meow.createdAt} />
			</div>
		</div>
	);
};

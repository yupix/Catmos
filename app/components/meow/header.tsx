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
				<span className='font-semibold'>
				{meow.author.displayName || meow.author.name}

				</span>
				<span className='text-slate-500'>
				{meow.author.displayName ? `@${meow.author.name}` : null}
				</span>
			</HoverUserCard>

			<div className="shrink-0">
				<TimeDisplay date={meow.createdAt} />
			</div>
		</div>
	);
};

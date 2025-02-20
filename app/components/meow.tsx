import type { File, Meow, User } from '@prisma/client';
import { TbArrowBack, TbDots, TbPlus, TbRepeat } from 'react-icons/tb';
import { cn, getDateTimeString } from '~/lib/utils';
import { HoverUserCard } from './hover-user-card';
import { Avatar, AvatarFallback, AvatarImage } from './shadcn/ui/avatar';

export type IMeow = Meow & {
	author: User;
	attachments: File[];
};

export function Meow({ meow }: { meow: IMeow }) {
	const dateInfo = getDateTimeString(meow.createdAt);
	return (
		<div className="inset-shadow-black/10 inset-shadow-sm max-w-[700px] rounded-xl border p-4">
			<div className="flex gap-4">
				<HoverUserCard user={meow.author}>
					<Avatar className="h-15 w-15">
						<AvatarImage src={meow.author.avatarUrl} alt={meow.author.name} />
						<AvatarFallback>{meow.author.name}</AvatarFallback>
					</Avatar>
				</HoverUserCard>
				<div className="w-full">
					<div className="flex justify-between">
						<HoverUserCard user={meow.author}>
							<div className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap">
								<p className="max-w-40 overflow-hidden text-ellipsis whitespace-nowrap">
									{meow.author.displayName || meow.author.name}{' '}
									<span className="ml-1 text-gray-400">
										@{meow.author.name}
									</span>
								</p>
							</div>
						</HoverUserCard>

						<time
							className={cn(
								dateInfo.color === 'red'
									? 'text-red-400'
									: dateInfo.color === 'yellow'
										? 'text-yellow-400'
										: null,
							)}
							title={meow.createdAt.toString()}
						>
							{dateInfo.text}
						</time>
					</div>
					<div className="mb-2 pt-2">{meow.text}</div>
					<div className="flex gap-4 text-slate-700 ">
						<TbArrowBack className="cursor-pointer" strokeWidth={3} />
						<TbRepeat className="cursor-pointer" strokeWidth={3} />
						<TbPlus className="cursor-pointer" strokeWidth={3} />
						<TbDots className="cursor-pointer" strokeWidth={3} />
					</div>
				</div>
			</div>
		</div>
	);
}

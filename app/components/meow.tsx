import { TbArrowBack, TbDots, TbPlus, TbRepeat } from 'react-icons/tb';
import { cn, getDateTimeString } from '~/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './shadcn/ui/avatar';

export type IMeow = {
	id: string;
	text: string;
	createdAt: string;
	author: {
		name: string;
		avatarUrl: string;
	};
};

export function Meow({ meow }: { meow: IMeow }) {
	const dateInfo = getDateTimeString(meow.createdAt);
	return (
		<div className="inset-shadow-black/10 inset-shadow-sm max-w-[700px] rounded-xl border p-4">
			<div className="flex justify-between border-b pb-2">
				<div className="flex items-center gap-1">
					<Avatar className="h-10 w-10">
						<AvatarImage src={meow.author.avatarUrl} alt={meow.author.name} />
						<AvatarFallback>{meow.author.name}</AvatarFallback>
					</Avatar>
					<div className="flex items-center">
						{meow.author.name}
						<span className="ml-2 text-gray-400 text-xs">
							@{meow.author.name}
						</span>
					</div>
				</div>

				<time
					className={cn(
						dateInfo.color === 'red'
							? 'text-red-400'
							: dateInfo.color === 'yellow'
								? 'text-yellow-400'
								: null,
					)}
					title={meow.createdAt}
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
	);
}

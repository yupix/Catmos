import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import * as emojilib from 'emojilib';
import { type FC, useCallback, useRef } from 'react';
import {
	TbArrowBack,
	TbDots,
	TbMinus,
	TbPlus,
	TbQuote,
	TbRepeat,
} from 'react-icons/tb';
import { Form, useFetcher } from 'react-router';
import { useEmojiPicker } from '~/hooks/use-emoji-picker';
import { useModal } from '~/hooks/use-modal';
import type { IMeow } from '~/lib/const.server';
import { PostModal } from '../post-modal';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../shadcn/ui/dropdown-menu';
import { MeowMoreMenu } from './more-menu';

interface MeowActionsProps {
	meow: IMeow;
	isReacted: boolean;
}

export const MeowAction: FC<MeowActionsProps> = ({ meow, isReacted }) => {
	const plusButtonRef = useRef<HTMLDivElement>(null);
	const { openModal, closeModal } = useModal();
	const { openEmojiPicker } = useEmojiPicker();

	const fetcher = useFetcher();

	const handleReplyClick = useCallback(() => {
		openModal(<PostModal replyTo={meow} closeModal={closeModal} />);
	}, [openModal, closeModal, meow]);

	const handleEmojiRemove = () => {
		fetcher.submit(
			{},
			{
				action: `/meows/${meow.id}/reaction`,
				method: 'DELETE',
			},
		);
	};

	const handleEmojiSelect = (emoji: EmojiClickData, event: MouseEvent) => {
		const emojiName = emojilib.default[emoji.emoji][0].replaceAll('_', '-');

		fetcher.submit(
			{ reaction: emojiName },
			{
				action: `/meows/${meow.id}/reaction`,
				method: 'POST',
			},
		);
	};

	const handleEmojiPickerToggle = () => {
		if (plusButtonRef.current)
			openEmojiPicker(
				plusButtonRef.current,
				<EmojiPicker onEmojiClick={handleEmojiSelect} />,
			);
	};

	return (
		<div className="flex flex-wrap @min-[300px]:gap-14 gap-2 text-slate-400 text-xl">
			<TbArrowBack
				className="cursor-pointer"
				strokeWidth={3}
				onClick={handleReplyClick}
			/>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<TbRepeat className="shrink-0 cursor-pointer" strokeWidth={3} />
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<Form action="/?index" method="POST">
						<input type="hidden" name="intent" value="post" />
						<input type="hidden" name="remeowId" value={meow.id} />
						<DropdownMenuItem className="cursor-pointer">
							<button type="submit" className="flex w-full items-center gap-2">
								<TbRepeat strokeWidth={2} />
								ReMeow
							</button>
						</DropdownMenuItem>
					</Form>
					<DropdownMenuItem className="cursor-pointer">
						<TbQuote strokeWidth={2} />
						Quote
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			{isReacted ? (
				<TbMinus
					className="shrink-0 cursor-pointer"
					strokeWidth={3}
					onClick={handleEmojiRemove}
				/>
			) : (
				<TbPlus
					className="shrink-0 cursor-pointer"
					strokeWidth={3}
					ref={plusButtonRef}
					onClick={handleEmojiPickerToggle}
				/>
			)}
			<MeowMoreMenu meow={meow}>
				<TbDots className="shrink-0 cursor-pointer" strokeWidth={3} />
			</MeowMoreMenu>
		</div>
	);
};

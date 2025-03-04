import type { EmojiClickData } from 'emoji-picker-react';
import * as emojilib from 'emojilib';
import { AnimatePresence, motion } from 'motion/react';
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from 'react';

interface EmojiPickerContextType {
	isOpen: boolean;
	openEmojiPicker: (triggerElement: HTMLElement, content: ReactNode) => void;
	closeEmojiPicker: () => void;
	onEmojiClick: (emoji: EmojiClickData, event: MouseEvent) => void;
	setOnEmojiClick: (
		callback: (emoji: string, event: MouseEvent) => void,
	) => void;
}

const EmojiPickerContext = createContext<EmojiPickerContextType | undefined>(
	undefined,
);

export const EmojiPickerProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [position, setPosition] = useState<{
		top: number;
		left: number;
	} | null>(null);
	const [emojiPicker, setEmojiPicker] = useState<ReactNode | null>(null);
	const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(
		null,
	);
	const [customOnEmojiClick, setCustomOnEmojiClick] = useState<
		((emoji: string, event: MouseEvent) => void) | null
	>(null);

	const openEmojiPicker = (element: HTMLElement, content: ReactNode) => {
		setTriggerElement(element);
		const rect = element.getBoundingClientRect();
		setEmojiPicker(content);
		setPosition({ top: rect.bottom, left: rect.left });
		setIsOpen(true);
	};

	const closeEmojiPicker = () => setIsOpen(false);

	const onEmojiClick = (emoji: EmojiClickData, event: MouseEvent) => {
		const emojiName = emojilib.default[emoji.emoji][0].replaceAll('_', '-');

		if (customOnEmojiClick) {
			customOnEmojiClick(emojiName, event);
		} else {
			console.log(emojiName); // Default behavior
		}
		closeEmojiPicker();
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (triggerElement && !triggerElement.contains(event.target as Node)) {
				closeEmojiPicker();
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [triggerElement]);

	return (
		<EmojiPickerContext.Provider
			value={{
				isOpen,
				openEmojiPicker,
				closeEmojiPicker,
				onEmojiClick,
				setOnEmojiClick: setCustomOnEmojiClick,
			}}
		>
			{children}
			<AnimatePresence>
				{isOpen && position && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						style={{
							position: 'absolute',
							top: position.top,
							left: position.left,
							zIndex: 50,
						}}
					>
						{emojiPicker}
					</motion.div>
				)}
			</AnimatePresence>
		</EmojiPickerContext.Provider>
	);
};

export const useEmojiPicker = (): EmojiPickerContextType => {
	const context = useContext(EmojiPickerContext);
	if (context === undefined) {
		throw new Error(
			'useEmojiPicker must be used within an EmojiPickerProvider',
		);
	}
	return context;
};

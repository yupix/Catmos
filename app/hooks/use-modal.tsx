import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from 'react';
import { TbX } from 'react-icons/tb';

interface ModalContextType {
	isModalOpen: boolean;
	modalContent: ReactNode | null;
	openModal: (content: ReactNode) => void;
	closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalContent, setModalContent] = useState<ReactNode | null>(null);

	const openModal = (content: ReactNode) => {
		setModalContent(content);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				closeModal();
			}
		});
	}, []);

	return (
		<ModalContext.Provider
			value={{ isModalOpen, modalContent, openModal, closeModal }}
		>
			{children}
			<AnimatePresence>
				{isModalOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 bg-opacity-50"
						onClick={closeModal}
						onKeyDown={(e) => e.key === 'Escape' && closeModal()}
					>
						<div
							className="w-[450px] rounded-4xl bg-white p-5"
							onClick={(e) => e.stopPropagation()} // クリックイベントがバブルアップしないようにする
							onKeyDown={(e) => e.stopPropagation()}
						>
							<button
								type="button"
								onClick={closeModal}
								className="cursor-pointer"
							>
								<TbX className="h-6 w-6" />
							</button>
							<div className="p-2">{modalContent}</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</ModalContext.Provider>
	);
};
export const useModal = (): ModalContextType => {
	const context = useContext(ModalContext);
	if (context === undefined) {
		throw new Error('useModal must be used within a ModalProvider');
	}
	return context;
};

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { socket } from '~/lib/socket.client';
import { type IMeow, Meow } from './meow';

export default function Timeline() {
	return <ClientOnly fallback={<>loading</>}>{() => <Client />}</ClientOnly>;
}

export function Client() {
	const [meows, setMeows] = useState<IMeow[]>([]);
	const [newMeows, setNewMeows] = useState<IMeow[]>([]);
	const [isConnected, setIsConnected] = useState(socket.connected);
	const [isAtTop, setIsAtTop] = useState(true);

	const handleScrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	useEffect(() => {
		const handleConnect = () => {
			console.log('connected');
			setIsConnected(true);
		};

		const handleDisconnect = () => {
			setIsConnected(false);
		};

		const handleMessage = (meow: any) => {
			console.log('meow', meow);
			if (isAtTop) {
				setMeows((prev) => [meow, ...prev]);
			} else {
				setNewMeows((prev) => [meow, ...prev]);
			}
		};

		socket.on('connect', handleConnect);
		socket.on('disconnect', handleDisconnect);
		socket.on('meow', handleMessage);

		const handleScroll = () => {
			const atTop = window.scrollY === 0;
			setIsAtTop(atTop);
			if (atTop && newMeows.length > 0) {
				setMeows((prev) => [...newMeows, ...prev]);
				setNewMeows([]);
			}
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			socket.off('connect', handleConnect);
			socket.off('disconnect', handleDisconnect);
			socket.off('meow', handleMessage);
			window.removeEventListener('scroll', handleScroll);
		};
	}, [isAtTop, newMeows]);

	return (
		<div className="w-full p-5">
			{newMeows.length > 0 && (
				<button
					type="button"
					className="sticky top-10 mx-auto mb-4 block w-fit cursor-pointer rounded-xl bg-blue-400 px-5 py-2 text-center text-sm text-white transition-all duration-200 hover:bg-blue-500"
					onClick={handleScrollToTop}
					onKeyDown={handleScrollToTop}
				>
					{newMeows.length} 件の鳴き声があります
				</button>
			)}
			{isConnected ? (
				<AnimatePresence>
					{meows.map((meow) => (
						<motion.div
							className="mb-4"
							key={meow.id}
							layout
							initial={{ opacity: 0, y: -20, scale: 0.9 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -20, scale: 0.9 }}
							transition={{ duration: 0.4, ease: 'easeOut' }}
						>
							<Meow meow={meow} />
						</motion.div>
					))}
				</AnimatePresence>
			) : (
				<div>Connecting...</div>
			)}
		</div>
	);
}

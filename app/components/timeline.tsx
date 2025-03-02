import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { ClientOnly } from 'remix-utils/client-only';
import SuperJSON from 'superjson';
import { useScrollPosition } from '~/hooks/use-scroll';
import type { IMeow } from '~/lib/const.server';
import { socket } from '~/lib/socket.client';
import { Meow } from './meow';

interface TimelineProps {
	initMeows: IMeow[];
}

export default function Timeline({ initMeows }: TimelineProps) {
	return <ClientOnly>{() => <Client initMeows={initMeows} />}</ClientOnly>;
}

export function Client({ initMeows }: TimelineProps) {
	const [meows, setMeows] = useState<IMeow[]>(initMeows);
	const [newMeows, setNewMeows] = useState<IMeow[]>([]);
	const [isConnected, setIsConnected] = useState(socket.connected);
	const [isAtTop, setIsAtTop] = useState(true);
	const { scrollHeight, scrollTop, ref } = useScrollPosition();
	const [searchParams, _] = useSearchParams();
	const nowTab = searchParams.get('tab') ?? 'home';

	useEffect(() => {
		const isTop = scrollTop === 0;
		console.log(isTop, newMeows);
		if (isTop && newMeows.length > 0) {
			setMeows((prev) => [...newMeows, ...prev]);
			setNewMeows([]);
		}
	}, [newMeows, scrollTop]);

	useEffect(() => {
		setMeows(initMeows);
	}, [initMeows]);

	const handleScrollToTop = () => {
		ref.current?.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// タブが変わったらトップにスクロール
	useEffect(() => {
		handleScrollToTop();
	}, [nowTab]);

	useEffect(() => {
		const handleConnect = () => {
			console.log('connected');
			setIsConnected(true);
		};

		const handleDisconnect = () => {
			setIsConnected(false);
		};

		const handleMessage = (_meow: string) => {
			const audio = new Audio('/notification.mp3');
			audio.play();
			const meow = SuperJSON.parse<IMeow>(_meow);
			console.log('新着', isAtTop);
			if (isAtTop) {
				setMeows((prev) => [meow, ...prev]);
			} else {
				setNewMeows((prev) => [meow, ...prev]);
			}
		};

		socket.on('connect', handleConnect);
		socket.on('disconnect', handleDisconnect);
		socket.on('meow', handleMessage);

		return () => {
			socket.off('connect', handleConnect);
			socket.off('disconnect', handleDisconnect);
			socket.off('meow', handleMessage);
		};
	}, [isAtTop, newMeows]);

	return useMemo(
		() => (
			<div className="w-full p-[1px] md:p-5">
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
								className="my-6 border-b pb-6"
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
		),
		[isConnected, isAtTop, newMeows, meows],
	);
}

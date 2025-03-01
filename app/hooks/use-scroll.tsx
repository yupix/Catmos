import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';

// スクロール位置を管理するコンテキストを作成
export const scrollContext = createContext<{
	ref: React.RefObject<HTMLDivElement | null>;
} | null>(null);

// スクロール位置を管理するプロバイダーコンポーネント
export function ScrollContextProvider({
	children,
}: { children: React.ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);

	return (
		<scrollContext.Provider value={{ ref }}>{children}</scrollContext.Provider>
	);
}

// スクロール位置を取得するカスタムフック
export const useScroll = () => {
	const scroll = useContext(scrollContext);

	if (!scroll) {
		throw new Error('useScroll must be used within a ScrollContextProvider');
	}

	return scroll;
};

// スクロール位置を監視するカスタムフック
export const useScrollPosition = () => {
	const [scrollHeight, setScrollHeight] = useState(0);
	const [scrollTop, setScrollTop] = useState(0);
	const { ref } = useScroll();

	const onScroll = useCallback(() => {
		if (ref.current) {
			setScrollHeight(ref.current.scrollHeight);
			setScrollTop(ref.current.scrollTop);
		}
	}, [ref]);

	useEffect(() => {
		if (ref.current) {
			ref.current.addEventListener('scroll', onScroll);
		}
		return () => {
			if (ref.current) {
				ref.current.removeEventListener('scroll', onScroll);
			}
		};
	}, [onScroll, ref]);

	return { scrollHeight, scrollTop, ref };
};

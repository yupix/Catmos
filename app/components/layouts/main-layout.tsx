import type { ReactNode } from 'react';
import { ScrollContextProvider, useScroll } from '~/hooks/use-scroll';

function Layout({ children }: { children: ReactNode }) {
	const { ref } = useScroll();
	return (
		<div className="max-h-screen w-full overflow-y-scroll" ref={ref}>
			<div className="mx-auto max-w-full md:max-w-[80%]">
				<div className="w-full p-5">
					<div className="inset-shadow-black/10 inset-shadow-sm rounded-2xl p-5">
						{children}
					</div>
				</div>
			</div>
		</div>
	);
}

interface MainLayoutProps {
	children: ReactNode;
	header?: ReactNode;
}

export function MainLayout({ children, header }: MainLayoutProps) {
	return (
		<div className="w-full">
			<ScrollContextProvider>
				{header && <div>{header}</div>}
				<Layout>{children}</Layout>
			</ScrollContextProvider>
		</div>
	);
}

/**
 * メインレイアウトのヘッダーコンポーネント
 * @param {ReactNode} children - 子要素
 * @returns {JSX.Element} ヘッダー
 */
MainLayout.header = function MainLayoutHeader({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<div className="sticky bottom-0 z-10 flex w-full items-center justify-between bg-slate-200/60 backdrop-blur-md px-10 md:top-0">
			<div className="flex-grow h-full">{children}</div>
		</div>
	);
};

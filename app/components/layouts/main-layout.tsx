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

export function MainLayout({ children }: { children: ReactNode }) {
	return (
		<ScrollContextProvider>
			<Layout>{children}</Layout>
		</ScrollContextProvider>
	);
}

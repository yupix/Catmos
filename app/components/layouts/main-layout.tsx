import type { ReactNode } from 'react';

export function MainLayout({ children }: { children: ReactNode }) {
	return (
		<div className="w-full p-5">
			<div className="inset-shadow-black/10 inset-shadow-sm rounded-2xl p-5">
				{children}
			</div>
		</div>
	);
}

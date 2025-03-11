import {
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	data,
	isRouteErrorResponse,
	useLoaderData,
} from 'react-router';
import { getToast } from 'remix-toast';

import type { Route } from './+types/root';
import './app.css';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { TbPencil } from 'react-icons/tb';
import { toast } from 'sonner';
import { AppSidebar } from './components/app-sidebar';
import { PostModal } from './components/post-modal';
import { Button } from './components/shadcn/ui/button';
import { SidebarProvider } from './components/shadcn/ui/sidebar';
import { Toaster } from './components/shadcn/ui/sonner';
import { Sidebar } from './components/sidebar';
import { EmojiPickerProvider } from './hooks/use-emoji-picker';
import { ModalProvider, useModal } from './hooks/use-modal';
import type { User } from './lib/auth/auth.server';
import { getSession } from './lib/auth/session.server';
import { NotificationService } from './lib/notification.server';
import Welcome from './routes/welcome';

export const links: Route.LinksFunction = () => [
	{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous',
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
	},
	{
		rel: 'preconnect',
		href: 'https://fonts.googleapis.com',
	},
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous',
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=BIZ+UDGothic&family=BIZ+UDPGothic:wght@400;700&display=swap',
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=BIZ+UDGothic&family=BIZ+UDPGothic:wght@400;700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap',
	},
];

export async function loader({ request }: Route.LoaderArgs) {
	const user = await getSession<User>(request);
	const { toast, headers } = await getToast(request);

	if (!user) {
		return data({ user: null, toast }, { headers });
	}

	const notificationService = new NotificationService(user.id);
	const notifications = await notificationService.getNotifications();
	return data({ user, notifications, toast }, { headers });
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<EmojiPickerProvider>
					<ModalProvider>{children}</ModalProvider>
				</EmojiPickerProvider>
				<Toaster />
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

function Modal() {
	const { openModal, closeModal, isModalOpen } = useModal();
	const handleOpenModal = () => {
		openModal(<PostModal closeModal={closeModal} />);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'n' && !isModalOpen) {
				e.preventDefault();
				handleOpenModal();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isModalOpen]);

	return (
		<div className="fixed right-[10%] bottom-10 md:right-[20%]">
			<Button
				onClick={handleOpenModal}
				className="h-12 w-12 cursor-pointer rounded-full bg-blue-400 shadow-lg hover:bg-blue-500"
			>
				<TbPencil strokeWidth={2} />
			</Button>
		</div>
	);
}

export default function App() {
	const data = useLoaderData<typeof loader>();
	useEffect(() => {
		if (data.toast) {
			// Call your toast function here
			switch (data.toast.type) {
				case 'success':
					toast.success(data.toast.message);
					break;
				case 'error':
					toast.error(data.toast.message);
					break;
				case 'warning':
					toast.warning(data.toast.message);
					break;
				case 'info':
					toast.info(data.toast.message);
					break;
			}
		}
	}, [data.toast]);

	return (
		<SidebarProvider>
			{data?.user ? (
				<>
					<AppSidebar user={data.user} />
					<div className="w-full">
						<div className="block md:flex md:flex-grow">
							<Outlet />
							<div id="sidebar" className="hidden md:block w-[25%]">
								<Sidebar notifications={data.notifications || []} />
							</div>

							<Modal />
						</div>
					</div>
				</>
			) : (
				<Welcome />
			)}
		</SidebarProvider>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = 'Oops!';
	let details = 'An unexpected error occurred.';
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? '404' : 'Error';
		details =
			error.status === 404 ? (
				<div className="flex flex-col items-center">
					<motion.div
						className="mb-4 mb-4w-fit rounded-4xl border-2"
						layoutId="404"
						// 左右上下に震えるアニメーション
						animate={{ x: [0, 2, -2, 0], y: [2, -2, 2, 2] }}
						transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
					>
						<img src="/mihoyo/404.webp" alt="404" className="h-50 w-50" />
					</motion.div>
					<div>
						<p className="text-xl">このページは存在しません。</p>
						<Link to="/" className="text-blue-500 underline">
							ホームに戻る
						</Link>
					</div>
				</div>
			) : (
				error.statusText || details
			);
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="container mx-auto p-4 pt-16">
			{/* <h1>{message}</h1> */}
			<p>{details}</p>
			{stack ? (
				<pre className="w-full overflow-x-auto p-4">
					<code>{stack}</code>
				</pre>
			) : null}
		</main>
	);
}

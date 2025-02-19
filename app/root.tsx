import {
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
	useLoaderData,
} from 'react-router';

import type { Route } from './+types/root';
import './app.css';
import { motion } from 'motion/react';
import { AppSidebar } from './components/app-sidebar';
import { SidebarProvider } from './components/shadcn/ui/sidebar';
import type { User } from './lib/auth/auth.server';
import { getSession } from './lib/auth/session.server';

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

	return { user };
}

export function Layout({ children }: { children: React.ReactNode }) {
	const data = useLoaderData<typeof loader>();
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<SidebarProvider>
					{data?.user ? (
						<>
							<AppSidebar
								user={{ name: data.user.name, avatarUrl: data.user.avatarUrl }}
							/>
						</>
					) : null}
					{children}
				</SidebarProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
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
						<img src="/404.webp" alt="404" className="h-50 w-50" />
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
		<main className="pt-16 p-4 container mx-auto">
			{/* <h1>{message}</h1> */}
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}

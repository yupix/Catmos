import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { reactRouterHonoServer } from 'react-router-hono-server/dev';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());

	return {
		build: {
			target: 'esnext',
		},
		plugins: [
			tailwindcss(),
			//			reactRouterDevTools(),
			reactRouterHonoServer(),
			reactRouter(),
			tsconfigPaths(),
		],
		ssr: {
			noExternal: ['remix-utils'],
		},
		server: {
			host: '0.0.0.0',
			port: Number.parseInt(env.PORT || '5173'),
		},
	};
});

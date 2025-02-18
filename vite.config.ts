import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { reactRouterHonoServer } from 'react-router-hono-server/dev';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());

	return {
		plugins: [
			tailwindcss(),
			reactRouterHonoServer(),
			reactRouter(),
			tsconfigPaths(),
		],
		server: {
			port: Number.parseInt(env.PORT || '5173'),
		},
	};
});

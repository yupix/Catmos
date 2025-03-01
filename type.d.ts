/// <reference types="vite/client" />

import type { FC } from 'react';

interface ImportMetaEnv {
	VITE_ORIGIN: string;
}

declare module 'react' {
	type FCX<P = Record<string, unknown>> = FC<P & { className?: string }>;
}

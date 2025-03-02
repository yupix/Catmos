/// <reference types="vite/client" />
interface ImportMetaEnv {
	VITE_ORIGIN: string;
}

/// <reference types="react-scripts" />
declare module 'react' {
  type FCX<P = {}> = React.FC<P & { className?: string }>
}
import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_PUBLIC_ORIGIN;
export const socket = io(URL);

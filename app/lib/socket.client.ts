import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_ORIGIN;
export const socket = io(URL, { withCredentials: true });

import { createHonoServer } from 'react-router-hono-server/node';
import { Server } from 'socket.io';
import { redisSubscriber } from './lib/redis.server';

console.log('loading server');

redisSubscriber.subscribe('meow', (err, count) => {
	console.log('Subscribed to meow channel');
});

export default await createHonoServer({
	onServe(server) {
		const io = new Server(server, {
			cors: {
				origin: (origin, fn) => {
					// 開発環境では全てのリクエストを許可
					if (process.env.NODE_ENV === 'development') {
						fn(null, true);
						return;
					}

					// 本番環境では特定のドメインからのリクエストのみ許可
					if (origin === 'https://catmos.catarks.org') {
						fn(null, true);
					} else {
						fn(new Error('Not allowed'));
					}
				},
			},
		});

		io.on('connection', (socket) => {
			console.log('New connection 🔥', socket.id);

			redisSubscriber.on('message', (channel, message) => {
				console.log('Message received:', message);
				socket.emit('meow', message);
			});

			socket.on('disconnect', (reason) => {
				// called when the underlying connection is closed
				console.log('Connection closed');
			});

			socket.on('message', (message) => {
				console.log(`Message from client: ${message}`);
				// Broadcast to all clients except sender
				socket.broadcast.emit('message', message);
			});
		});
	},
});

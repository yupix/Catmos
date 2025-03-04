import { createHonoServer } from 'react-router-hono-server/node';
import { Server } from 'socket.io';
import SuperJSON from 'superjson';
import { honoSideGetSession } from './lib/auth/session.server';
import type { IMeow } from './lib/const.server';
import { prisma } from './lib/db';
import { redis, redisSubscriber } from './lib/redis.server';

console.log('loading server');

const subScribeChannels = ['meow', 'notification', 'follow'];

for (const channel of subScribeChannels) {
	redisSubscriber.subscribe(channel, (err, count) => {
		console.log(`Subscribed to ${channel} channel`);
	});
}

export default await createHonoServer({
	onServe(server) {
		const io = new Server(server, {
			cors: {
				origin: import.meta.env.VITE_ORIGIN,
				credentials: true,
			},
		});

		io.use(async (socket, next) => {
			if (socket.handshake.headers.cookie === undefined) {
				return next(new Error('Unauthorized'));
			}

			const session = await honoSideGetSession(socket.handshake.headers.cookie);
			if (session) {
				socket.data.user = session;
				return next();
			}
			next(new Error('Unauthorized'));
		});

		redisSubscriber.on('message', async (channel, message) => {
			switch (channel) {
				case 'meow': {
					const followers = await prisma.user.findFirst({
						where: { id: SuperJSON.parse<IMeow>(message).authorId },
						select: {
							followers: {
								select: {
									id: true,
								},
							},
						},
					});

					if (!followers) {
						break;
					}

					for (const follower of followers.followers) {
						const socketId = await redis.get(`socket:${follower.id}`);
						if (!socketId) {
							continue;
						}
						io.to(socketId).emit('meow', message);
					}
					break;
				}
				case 'notification': {
					const data = SuperJSON.parse(message);
					const socketId = await redis.get(`socket:${data.targetId}`);
					if (!socketId) {
						break;
					}
					io.to(socketId).emit('notification', message);
					break;
				}
				default:
					break;
			}
		});

		io.on('connection', async (socket) => {
			console.log('New connection 🔥', socket.id);
			await redis.set(`socket:${socket.data.user.id}`, socket.id);

			socket.on('disconnect', async (reason) => {
				// called when the underlying connection is closed
				console.log('Connection closed');
				await redis.del(`socket:${socket.data.user.id}`);
			});

			socket.on('message', (message) => {
				console.log(`Message from client: ${message}`);
				// Broadcast to all clients except sender
				socket.broadcast.emit('message', message);
			});
		});
	},
});

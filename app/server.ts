import { createHonoServer } from 'react-router-hono-server/node';
import { Server } from 'socket.io';

console.log('loading server');

export default await createHonoServer({
	onServe(server) {
		const io = new Server(server);

		io.on('connection', (socket) => {
			console.log('New connection 🔥', socket.id);

			socket.on('disconnect', (reason) => {
				// called when the underlying connection is closed
				console.log('Connection closed');
			});

			socket.on('message', (message) => {
				console.log(`Message from client: ${message}`);
				// Broadcast to all clients except sender
				socket.broadcast.emit('message', message);
			});

			setInterval(() => {
				socket.broadcast.emit('meow', {
					id: new Date().toString() + Math.random(),
					text: 'こんにちは',
					author: {
						id: '1',
						name: 'yupix',
						avatar: 'https://github.com/yupix.png',
					},
					createdAt: new Date(),
				});
			}, 1000);
		});
	},
});

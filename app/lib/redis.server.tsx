import { Redis } from 'ioredis';
import { env } from './env.server';
import { singleton } from './singleton';

export const redis = singleton(
	'redis',
	() =>
		new Redis({
			host: env.REDIS_HOST,
			port: env.REDIS_PORT,
			password: env.REDIS_PASSWORD,
		}),
);

export const redisSubscriber = singleton(
	'redisSubscriber',
	() =>
		new Redis({
			host: env.REDIS_HOST,
			port: env.REDIS_PORT,
			password: env.REDIS_PASSWORD,
		}),
);

export const redisPublisher = singleton(
	'redisPublisher',
	() =>
		new Redis({
			host: env.REDIS_HOST,
			port: env.REDIS_PORT,
			password: env.REDIS_PASSWORD,
		}),
);

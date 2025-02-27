import type { Prisma } from '@prisma/client';
import type { User } from './auth/auth.server';

export const attachmentIncludes = {
	author: true,
	folder: true,
} as const satisfies Prisma.FileInclude;

const favoriteIncludes = (userId: string) =>
	({
		where: {
			userId,
		},
		select: {
			id: true,
		},
	}) as const satisfies Prisma.MeowInclude['favorites'];

export const MeowIncludes = (user: User) =>
	({
		attachments: { include: attachmentIncludes },
		author: true,
		reply: {
			include: {
				author: true,
				attachments: { include: attachmentIncludes },
				favorites: favoriteIncludes(user.id),
			},
		},
		remeow: {
			include: {
				author: true,
				attachments: { include: attachmentIncludes },
				favorites: favoriteIncludes(user.id),
			},
		},
		favorites: favoriteIncludes(user.id),
	}) as const satisfies Prisma.MeowInclude;

/**
 * Meowの型定義
 */
export type IMeow = Prisma.MeowGetPayload<{
	include: ReturnType<typeof MeowIncludes>;
}>;

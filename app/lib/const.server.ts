import type { Prisma } from '@prisma/client';
import type { User } from './auth/auth.server';

export const attachmentIncludes = {
	author: true,
	folder: true,
} as const satisfies Prisma.FileInclude;

const favoriteIncludes = (userId?: string) =>
	({
		where: {
			userId,
		},
		select: {
			id: true,
		},
	}) as const satisfies Prisma.MeowInclude['favorites'];

export const UserCardIncludes = {
	followers: {
		select: {
			id: true,
		},
	},
	_count: {
		select: {
			following: true,
			followers: true,
			meows: true,
		},
	},
} as const satisfies Prisma.UserInclude;

export const MeowReactionDefaultArgs = {
	select: {
		reaction: true,
		id: true,
		userId: true,
	},
} as const satisfies Prisma.MeowReactionDefaultArgs;

export const MeowIncludes = (user?: User) =>
	({
		attachments: { include: attachmentIncludes },
		author: { include: UserCardIncludes },
		reply: {
			include: {
				author: {
					include: UserCardIncludes,
				},
				attachments: { include: attachmentIncludes },
				favorites: favoriteIncludes(user?.id),
				MeowReaction: MeowReactionDefaultArgs,
			},
		},
		remeow: {
			include: {
				author: { include: UserCardIncludes },
				attachments: { include: attachmentIncludes },
				favorites: favoriteIncludes(user?.id),
				MeowReaction: MeowReactionDefaultArgs,
			},
		},
		MeowReaction: MeowReactionDefaultArgs,
		favorites: favoriteIncludes(user?.id),
	}) as const satisfies Prisma.MeowInclude;

/**
 * Meowの型定義
 */
export type IMeow = Prisma.MeowGetPayload<{
	include: ReturnType<typeof MeowIncludes>;
}>;

export type IUserCard = Prisma.UserGetPayload<{
	include: typeof UserCardIncludes;
}>;

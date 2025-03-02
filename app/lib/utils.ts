import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getDateFormatted(date: Date) {
	return date
		.toLocaleDateString('ja-JP', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		})
		.replaceAll('/', '-');
}

export function getDateTimeString(date: Date) {
	const now = new Date();
	const diff = now.getTime() - new Date(date).getTime();
	const diffSeconds = Math.floor(diff / 1000);
	const diffMinutes = Math.floor(diffSeconds / 60);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);
	const diffMonths = Math.floor(diffDays / 30);
	const diffYears = Math.floor(diffMonths / 12);
	if (diffSeconds < 60) {
		return { text: `${diffSeconds}秒前`, color: null };
	}
	if (diffMinutes < 60) {
		return { text: `${diffMinutes}分前`, color: null };
	}
	if (diffHours < 24) {
		return { text: `${diffHours}時間前`, color: null };
	}
	if (diffDays < 30) {
		return { text: `${diffDays}日前`, color: null };
	}
	if (diffMonths < 12) {
		return { text: `${diffMonths}ヶ月前`, color: 'yellow' };
	}
	return { text: `${diffYears}年前`, color: 'red' };
}
export function getUserName(
	user: { displayName?: string | null; name: string },
	isMentionStyle = false,
) {
	if (isMentionStyle) {
		return user.displayName
			? `${user.displayName}@${user.name}`
			: `${user.name}`;
	}
	return user.displayName || user.name;
}

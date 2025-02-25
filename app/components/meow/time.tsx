import { useEffect, useState } from 'react';
import { cn, getDateTimeString } from '~/lib/utils';

interface TimeDisplayProps {
	date: Date;
}

export function TimeDisplay({ date }: TimeDisplayProps) {
	const [currentDate, setCurrentDate] = useState(getDateTimeString(date));

	useEffect(() => {
		const intervalId = setInterval(() => {
			setCurrentDate(getDateTimeString(date));
		}, 1000);

		return () => clearInterval(intervalId);
	}, [date]);

	return (
		<time
			className={cn(
				currentDate.color === 'red'
					? 'text-red-400'
					: currentDate.color === 'yellow'
						? 'text-yellow-400'
						: null,
			)}
			// フォーマットを指定年月日 秒形式に変換
			title={date
				.toLocaleDateString('ja-JP', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
				})
				.replaceAll('/', '-')}
		>
			{currentDate.text}
		</time>
	);
}

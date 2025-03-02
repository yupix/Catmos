import { useEffect, useState } from 'react';
import { cn, getDateFormatted, getDateTimeString } from '~/lib/utils';

interface TimeDisplayProps {
	date: Date;
}

export function TimeDisplay({ date }: TimeDisplayProps) {
	const [currentDate, setCurrentDate] = useState(getDateTimeString(date));

	useEffect(() => {
		const intervalId = setInterval(() => {
			const newCurrentDate = getDateTimeString(date);
			if (newCurrentDate.text !== currentDate.text) {
				setCurrentDate(newCurrentDate);
			}
		}, 1000);

		return () => clearInterval(intervalId);
	}, [date, currentDate]);

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
			title={getDateFormatted(date)}
		>
			{currentDate.text}
		</time>
	);
}

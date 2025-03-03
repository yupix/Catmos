import type { FC } from 'react';
import { Link as RouterLink } from 'react-router';
import { useModal } from '~/hooks/use-modal';

interface LinkProps {
	to: string;
	children: React.ReactNode;
}

export const Link: FC<LinkProps> = (props) => {
	const isExternal = isAbsoluteUrl(props.to);

	const { openModal, closeModal } = useModal();

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		openModal(
			<div className="px-2">
				<h1 className="mb-4 text-2xl">外部リンクの可能性</h1>
				<p className="mb-2">
					下記のリンクは本サイト外のページに遷移する可能性があります。よろしいですか？
				</p>
				<p className="text-gray-500 text-sm">{props.to}</p>
				<div className="mt-4 flex justify-end">
					<button
						type="button"
						className="cursor-pointer rounded-2xl bg-gray-200 px-4 py-2 transition-colors duration-75 hover:bg-gray-300"
						onClick={closeModal}
					>
						キャンセル
					</button>
					<a
						href={props.to}
						target="_blank"
						rel="noreferrer noreferrer noopener"
						className="ml-4 rounded-2xl bg-blue-500 px-4 py-2 text-white transition-colors duration-0 hover:bg-blue-600"
					>
						はい
					</a>
				</div>
			</div>,
		);
	};

	if (isExternal) {
		return (
			<a
				onClick={handleClick}
				href={props.to}
				{...props}
				rel="noreferrer noreferrer noopener"
				target="_blank"
			>
				{props.children}
			</a>
		);
	}

	return (
		<RouterLink {...props} to={props.to}>
			{props.children}
		</RouterLink>
	);
};

function isAbsoluteUrl(str: string) {
	// https://github.com/sindresorhus/is-absolute-url/blob/main/index.js
	const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
	const WINDOWS_PATH_REGEX = /^[a-zA-Z]:\\/;

	if (WINDOWS_PATH_REGEX.test(str)) {
		return false;
	}
	return ABSOLUTE_URL_REGEX.test(str);
}

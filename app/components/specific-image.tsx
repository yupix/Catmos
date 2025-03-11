type Props = React.ComponentProps<'img'>;

export const SpecificImage = (props: Omit<Props, 'className'>) => {
	// biome-ignore lint/a11y/useAltText: <explanation>
	return <img {...props} className="mb-4 h-30 w-30 rounded-xl" />;
};

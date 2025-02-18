import type { Meta, StoryObj } from '@storybook/react';
import { PostModal } from './post-modal';
import '~/storybook.css';

const meta: Meta<typeof PostModal> = {
	title: 'Components/PostModal',
	component: PostModal,
	argTypes: {
		isOpen: { control: 'boolean' },
		onClose: { action: 'onClose' },
		onSubmit: { action: 'onSubmit' },
	},
};

export default meta;

type Story = StoryObj<typeof PostModal>;

export const Default: Story = {
	args: {
		isOpen: true,
	},
};

export const Closed: Story = {
	args: {
		isOpen: false,
	},
};

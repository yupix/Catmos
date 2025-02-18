import type { Meta, StoryObj } from '@storybook/react';
import { type IMeow, Meow } from './meow';
import '~/storybook.css';

const meta: Meta<typeof Meow> = {
	title: 'Components/Meow',
	component: Meow,
	argTypes: {
		meow: {
			control: 'object',
		},
	},
};

export default meta;

type Story = StoryObj<typeof Meow>;

const sampleMeow: IMeow = {
	id: '1',
	text: 'これはサンプルのmeowです。',
	createdAt: new Date().toISOString(),
	author: {
		name: 'yupix',
		avatar: 'https://github.com/yupix.png',
	},
};

export const Default: Story = {
	args: {
		meow: sampleMeow,
	},
};

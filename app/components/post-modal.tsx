import { useRef } from 'react';
import { Form, useNavigation, useSubmit } from 'react-router';
import MeowTree, {} from '~/lib/meow-tree';
import { type IMeow, Meow } from './meow';
import { Button } from './shadcn/ui/button';
import { DialogHeader } from './shadcn/ui/dialog';

export interface PostModalProps {
	replyTo?: IMeow;
	closeModal: () => void;
}

function ReplyTo({ meow }: { meow: IMeow }) {
	// 返信元のメッセージを表示する
	return (
		<div className="p-2">
			<Meow meow={meow} disableActions />
		</div>
	);
}

export function PostModal({ replyTo, closeModal }: PostModalProps) {
	const form = useRef<HTMLFormElement>(null);
	const navigation = useNavigation();

	const submit = useSubmit();

	const handleSubmit = () => {
		submit(form.current, { method: 'POST' });
		console.log(closeModal);
		closeModal();
	};

	return (
		<div>
			{replyTo && (
				<div className="mb-4">
					<ReplyTo meow={replyTo} />
				</div>
			)}
			<Form action="/?index" method="POST" ref={form}>
				<DialogHeader />
				<input type="hidden" name="intent" value="post" />
				<MeowTree handleSubmit={handleSubmit} />
				<div className="flex justify-end">
					<Button
						className="w-fit"
						type="submit"
						disabled={navigation.state !== 'idle'}
					>
						MEOW!
					</Button>
				</div>
			</Form>
		</div>
	);
}

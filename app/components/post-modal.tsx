import { DialogTitle } from '@radix-ui/react-dialog';
import { useRef, useState } from 'react';
import { TbPencil } from 'react-icons/tb';
import { Form, useNavigation, useSubmit } from 'react-router';
import MeowTree from '~/lib/meow-tree';
import { Button } from './shadcn/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTrigger,
} from './shadcn/ui/dialog';

export function PostModal() {
	const form = useRef<HTMLFormElement>(null);
	const navigation = useNavigation();

	const [isOpen, setIsOpen] = useState(false);
	const submit = useSubmit();

	const handleSubmit = () => {
		console.log('submit');
		setIsOpen(false);
		submit(form.current, { method: 'POST' });
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger>
				<Button className="cursor-pointer" asChild size="icon">
					<TbPencil strokeWidth={2} />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>投稿</DialogTitle>
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
			</DialogContent>
		</Dialog>
	);
}

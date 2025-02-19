import { DialogTitle } from '@radix-ui/react-dialog';
import { TbPencil } from 'react-icons/tb';
import { Form, useNavigation } from 'react-router';
import MeowTree from '~/lib/meow-tree';
import { Button } from './shadcn/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTrigger,
} from './shadcn/ui/dialog';

export function PostModal() {
	const navigation = useNavigation();

	return (
		<Dialog>
			<DialogTrigger>
				<Button className="cursor-pointer" asChild size="icon">
					<TbPencil strokeWidth={2} />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>投稿</DialogTitle>
				<Form action="/?index" method="POST">
					<DialogHeader />
					<input type="hidden" name="intent" value="post" />
					<MeowTree />
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

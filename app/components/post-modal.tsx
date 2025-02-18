import { TbPencil } from 'react-icons/tb';
import { Form, useNavigation } from 'react-router';
import { Button } from './shadcn/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTrigger,
} from './shadcn/ui/dialog';

export function PostModal() {
	// 投稿中かどうかの状態を管理する
	const navigation = useNavigation();

	return (
		<Dialog>
			<DialogTrigger>
				<Button className="cursor-pointer">
					<TbPencil strokeWidth={2} />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<Form action="/?index" method="POST">
					<DialogHeader />
					<input type="hidden" name="intent" value="post" />
					<textarea
						name="text"
						placeholder="今どんな気分？"
						className="scroll resize-none"
					/>
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

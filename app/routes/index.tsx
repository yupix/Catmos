import { TbPencil } from 'react-icons/tb';
import { useLoaderData } from 'react-router';
import {} from '~/components/shadcn/ui/avatar';
import { Button } from '~/components/shadcn/ui/button';
import Timeline from '~/components/timeline';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'New React Router App' },
		{ name: 'description', content: 'Welcome to React Router!' },
	];
}

export function loader({ request }: Route.LoaderArgs) {
	const meows = [
		{
			id: 'koerkgoreigjeijgeo',
			text: 'こんにちは',
			author: {
				id: '1',
				name: 'yupix',
				avatar: 'https://github.com/yupix.png',
			},
			createdAt: new Date(1719757656393),
		},
	];

	return { meows };
}

export default function Home() {
	const { meows } = useLoaderData<typeof loader>();
	return (
		<div className=" w-full p-5">
			<div className="relative">
				<div className="fixed right-5 bottom-5 z-10">
					<Button className="cursor-pointer">
						<TbPencil strokeWidth={2} />
					</Button>
				</div>
			</div>
			<Timeline />
		</div>
	);
}

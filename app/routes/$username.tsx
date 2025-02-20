import { data, useLoaderData } from 'react-router';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '~/components/shadcn/ui/avatar';
import { prisma } from '~/lib/db';
import type { Route } from './+types/$username';

export async function loader({ params }: Route.LoaderArgs) {
	const username = params.username;
	const foundUser = await prisma.user.findFirst({
		where: {
			name: username,
		},
	});

	if (!foundUser) {
		throw data('User not found', { status: 404 });
	}

	return { user: foundUser };
}

export default function User() {
	const { user } = useLoaderData<typeof loader>();
	return (
		<div className="mx-5 my-20 w-full transition-all duration-300  md:mx-10">
			<div className="relative">
				<div className="h-90 w-full rounded-lg bg-[url(https://s3.akarinext.org/misskey/*/64ec861a-4b9d-40ad-a49e-45cf6a183190.webp)] bg-center bg-cover" />

				<div className="-bottom-8 absolute flex items-center gap-4 px-4">
					<Avatar className="h-32 w-32">
						<AvatarImage src={user?.avatarUrl} />
						<AvatarFallback>{user.name}</AvatarFallback>
					</Avatar>
					<div className="text-white [text-shadow:_0_2px_4px_rgba(0,0,0,0.5)]">
						<h1 className="text-2xl">{user.name}</h1>
						<p className="text-gray-300">@{user.name}</p>
					</div>
				</div>
			</div>
		</div>
	);
}

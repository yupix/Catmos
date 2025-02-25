import { useLoaderData } from 'react-router';
import { getUserSession } from '~/lib/auth/auth.server';
import { prisma } from '~/lib/db';
import type { Route } from './+types';

export async function loader({ request }: Route.LoaderArgs) {
	const user = await getUserSession(request);
	const files = await prisma.file.findMany({
		where: {
			author: {
				sub: user?.sub,
			},
		},
	});
	return { files };
}

export default function Index() {
	const { files } = useLoaderData<typeof loader>();
	return (
		<div>
			{files.map((file) => (
				<div key={file.id}>
					{file.mimetype.split('/')[0] === 'image' ? (
						<img src={file.url} alt={file.filename} />
					) : (
						<a href={file.url} download>
							{file.filename}
						</a>
					)}
				</div>
			))}
		</div>
	);
}

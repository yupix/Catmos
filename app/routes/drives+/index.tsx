import { useLoaderData } from 'react-router';
import { FileViewer } from '~/components/file-viewer';
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
		<div className="@container grid grid-cols-1 gap-8 md:grid-cols-12">
			{files.map((file) => (
				<div
					key={file.id}
					className="@min-[300px]:col-span-4 col-span-12 mb-2 flex flex-col items-center gap-2"
				>
					<FileViewer file={file} />
					<p className="break-all">{file.filename}</p>
				</div>
			))}
		</div>
	);
}

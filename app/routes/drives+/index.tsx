import {Link, useLoaderData } from 'react-router';
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
		<div className=" flex flex-wrap justify-center gap-8 bg-slate-50">
			{files.map((file) => (
				<Link
					to={`/drives/file/${file.id}`}
					key={file.id}
					className="@container mb-2 flex w-full max-w-28 shrink-0 cursor-pointer flex-col items-center gap-2 rounded-xl p-4 transition-all duration-75 hover:bg-slate-100"
				>
					<FileViewer
						file={file}
						className="aspect-square shrink-0 bg-white"
						isCompact
					/>
					<p className="break-all text-gray-500 text-xs">{file.filename}</p>
				</Link>
			))}
		</div>
	);
}

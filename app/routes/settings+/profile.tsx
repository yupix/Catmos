import { parseMultipartRequest } from '@mjackson/multipart-parser';
import { FileUpload } from '~/components/fileupload';
import { getUserSession } from '~/lib/auth/auth.server';
import { uploadHandler } from '~/lib/s3.server';
import type { Route } from './+types/profile';
export async function action({ request }: Route.ActionArgs) {
	const user = await getUserSession(request);
	if (!user) {
		return;
	}
	await parseMultipartRequest(request, async (part) => {
		const formData = await uploadHandler(user.sub).s3UploadHandler(part);
		const intent = formData.get('intent');
		console.log(intent);

		if (!formData.has('file')) {
			console.error('No file uploaded');
			return;
		}
	});
}

export default function Index() {
	return (
		<FileUpload action="/settings/profile" intent="avatar">
			<div>ハロー</div>
		</FileUpload>
	);
}

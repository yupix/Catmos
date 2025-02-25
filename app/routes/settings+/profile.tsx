import { parseMultipartRequest } from '@mjackson/multipart-parser';
import { data, redirect, useLoaderData } from 'react-router';
import { FileUpload } from '~/components/fileupload';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '~/components/shadcn/ui/avatar';
import { Button } from '~/components/shadcn/ui/button';
import { type User, getUserSession } from '~/lib/auth/auth.server';
import { setSession } from '~/lib/auth/session.server';
import { prisma } from '~/lib/db';
import { uploadHandler } from '~/lib/s3.server';
import { cn } from '~/lib/utils';
import type { Route } from './+types/profile';
export async function loader({ request }: Route.LoaderArgs) {
	const user = await getUserSession(request);
	if (!user) {
		throw {
			status: 401,
		};
	}

	return {
		user,
	};
}

export async function action({ request }: Route.ActionArgs) {
	const user = await getUserSession(request);
	if (!user) {
		throw data('Not Authorized', { status: 401 });
	}

	async function updateAvatar(user: User, avatarUrl: string) {
		await prisma.user.update({
			where: {
				sub: user?.sub,
			},
			data: {
				avatarUrl: avatarUrl,
			},
		});

		user.avatarUrl = avatarUrl;
		const headers = await setSession(request, user); // Cookieを更新

		// Cookieを更新
		throw redirect('/settings/profile', {
			headers: headers,
		});
	}

	async function updateBanner(user: User, bannerUrl: string) {
		await prisma.user.update({
			where: {
				sub: user?.sub,
			},
			data: {
				bannerUrl: bannerUrl,
			},
		});

		user.bannerUrl = bannerUrl;
		const headers = await setSession(request, user); // Cookieを更新

		// Cookieを更新
		throw redirect('/settings/profile', {
			headers: headers,
		});
	}

	const formData: FormData = new FormData();
	await parseMultipartRequest(request, async (part) => {
		const _formData = await uploadHandler(user.sub).s3UploadHandler(part);

		for (const [key, value] of _formData.entries()) {
			formData.append(key, value);
		}
	});

	const intent = formData.get('intent');
	for (const [key, value] of formData.entries()) {
		console.log(key, value);
	}
	const file = formData.get('file');
	if (!file) {
		console.error('No file uploaded');
		return;
	}

	switch (intent) {
		case 'avatar': {
			await updateAvatar(user, file.toString());
			break;
		}

		case 'banner': {
			await updateBanner(user, file.toString());
			break;
		}
		default:
			console.error('Invalid intent');
	}
}

export default function Index() {
	const { user } = useLoaderData<typeof loader>();
	return (
		<div className="inset-shadow-black/20 inset-shadow-sm mx-auto max-w-[600px] rounded-3xl bg-slate-50 pb-5">
			<div>
				<div className="relative mb-20">
					<div
						className={cn(
							'h-50 w-full rounded-lg bg-center bg-cover bg-gray-500',
						)}
						style={{
							backgroundImage: `url(${user.bannerUrl})`,
						}}
					/>
					<div className="absolute top-5 right-5">
						<FileUpload asChild action="/settings/profile" intent="banner">
							<Button>バナーを変更</Button>
						</FileUpload>
					</div>

					<div className="-bottom-15 absolute right-0 left-0 flex items-center justify-center gap-4">
						<FileUpload action="/settings/profile" intent="avatar">
							<Avatar className="h-32 w-32">
								<AvatarImage src={user.avatarUrl} alt="avatar" />
								<AvatarFallback>{user.name}</AvatarFallback>
							</Avatar>
						</FileUpload>
					</div>
				</div>
				<div className="mx-auto max-w-[80%]">
					<FileUpload asChild action="/settings/profile" intent="avatar">
						<Button>アバターを変更</Button>
					</FileUpload>
				</div>
			</div>
		</div>
	);
}

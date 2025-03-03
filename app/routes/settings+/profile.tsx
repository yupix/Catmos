import { parseWithZod } from '@conform-to/zod';
import { Form, data, redirect, useLoaderData } from 'react-router';
import { redirectWithSuccess } from 'remix-toast';
import { z } from 'zod';
import { FileUpload } from '~/components/fileupload';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '~/components/shadcn/ui/avatar';
import { Button } from '~/components/shadcn/ui/button';
import { Input } from '~/components/shadcn/ui/input';
import { Label } from '~/components/shadcn/ui/label';
import { type User, getUserSession } from '~/lib/auth/auth.server';
import { setSession } from '~/lib/auth/session.server';
import { prisma } from '~/lib/db';
import { multipartUploader } from '~/lib/uploader';
import { cn } from '~/lib/utils';
import type { Route } from '../+types';
export async function loader({ request }: Route.LoaderArgs) {
	const user = await getUserSession(request);
	const me = await prisma.user.findFirst({
		where: {
			sub: user?.sub,
		},
	});
	if (!user || !me) {
		throw {
			status: 401,
		};
	}

	return {
		me,
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

	const formData = await multipartUploader({ request, user });

	const intent = formData.get('intent');
	for (const [key, value] of formData.entries()) {
		console.log(key, value);
	}

	let file;

	if (formData.get('file')) {
		file = JSON.parse(formData.get('file')?.toString() || '') as {
			url: string;
			fileId: string;
			mime: string;
		};
	} else {
		file = undefined;
	}

	switch (intent) {
		case 'avatar': {
			if (!file) {
				console.error('No file uploaded');
				return;
			}
			await updateAvatar(user, file.url);
			break;
		}

		case 'banner': {
			if (!file) {
				console.error('No file uploaded');
				return;
			}
			await updateBanner(user, file.url);
			break;
		}
		case 'basic': {
			const schema = z.object({
				username: z.string().optional(),
				'display-name': z.string().optional(),
				bio: z.string().optional(),
			});

			const submission = parseWithZod(formData, {
				schema,
			});

			if (submission.status !== 'success') {
				return submission.reply();
			}

			const { username, 'display-name': displayName } = submission.value;
			const updatedUser = await prisma.user.update({
				where: {
					sub: user.sub,
				},
				data: {
					name: username,
					displayName: displayName,
					bio: submission.value.bio,
				},
			});

			user.name = updatedUser.name;
			user.displayName = updatedUser.displayName;
			const headers = await setSession(request, user); // Cookieを更新

			throw await redirectWithSuccess('/settings/profile', 'Saved', {
				headers: headers,
			});
		}
		default:
			console.error('Invalid intent');
	}
}

export default function Index() {
	const { me: user } = useLoaderData<typeof loader>();
	return (
		<>
			<div className="inset-shadow-black/20 inset-shadow-sm mx-auto  rounded-3xl bg-slate-50 pb-5 mb-5">
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
			<Form
				action="/settings/profile"
				method="post"
				encType="multipart/form-data"
			>
				<input type="hidden" name="intent" value="basic" />
				<div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
					<Label htmlFor="username">ユーザー名</Label>
					<Input
						type="text"
						id="username"
						name="username"
						defaultValue={user.name}
					/>
				</div>
				<div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
					<Label htmlFor="display-name">表示名</Label>
					<Input
						type="text"
						id="display-name"
						name="display-name"
						defaultValue={user.displayName ?? ''}
					/>
				</div>
				<div className="mb-4 grid w-full max-w-sm items-center gap-1.5">
					<Label htmlFor="bio">自己紹介</Label>
					<textarea
						name="bio"
						defaultValue={user.bio ?? ''}
						placeholder="Tell us about yourself..."
						rows={4}
						className="w-full resize-none rounded border p-2"
					/>
				</div>
				<Button type="submit">保存</Button>
			</Form>
		</>
	);
}

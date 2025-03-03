import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import type { CustomEmoji } from '@prisma/client';
import { LayoutGroup, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { TbPlus } from 'react-icons/tb';
import { useFetcher, useLoaderData } from 'react-router';
import { z } from 'zod';
import { Button } from '~/components/shadcn/ui/button';
import { Input } from '~/components/shadcn/ui/input';
import { Label } from '~/components/shadcn/ui/label';
import { useModal } from '~/hooks/use-modal';
import { type IUploadedFile, useFileUpload } from '~/hooks/use-upload';
import { getUserSession } from '~/lib/auth/auth.server';
import { prisma } from '~/lib/db';
import { multipartUploader } from '~/lib/uploader';
import type { Route } from '../+types';

const schema = z.object({
	file: z.string().nonempty(),
	name: z.string().nonempty(),
	aliases: z.string().nonempty(),
	category: z.string().nonempty().optional(),
});

const patchSchema = z.object({
	file: z.string().nonempty().optional(),
	name: z.string().nonempty().optional(),
	aliases: z.string().nonempty().optional(),
	category: z.string().nonempty().optional(),
});

export const loader = async ({ request }: Route.LoaderArgs) => {
	const me = await getUserSession(request);
	if (!me) return { status: 401 };

	const emojis = await prisma.customEmoji.findMany();
	return { emojis };
};

export const action = async ({ request }: Route.ActionArgs) => {
	const me = await getUserSession(request);
	if (!me) throw new Response('Not Authorized', { status: 401 });

	switch (request.method) {
		case 'POST': {
			const formData = await multipartUploader({ request, user: me });
			const submission = parseWithZod(formData, { schema });

			if (submission.status !== 'success') {
				console.log(submission.reply());
				return {
					lastResult: submission.reply(),
					result: null,
				};
			}

			const file = JSON.parse(submission.value.file) as IUploadedFile;
			await prisma.customEmoji.create({
				data: {
					url: file.url,
					name: submission.value.name,
					aliases: submission.value.aliases.split(' '),
				},
			});

			return {
				lastResult: submission.reply(),
				result: null,
			};
		}
		case 'PATCH': {
			const formData = await multipartUploader({ request, user: me });
			const submission = parseWithZod(formData, { schema: patchSchema });

			if (submission.status !== 'success') {
				console.log(submission.reply());
				return {
					lastResult: submission.reply(),
					result: null,
				};
			}

			const file = submission.value.file
				? (JSON.parse(submission.value.file) as IUploadedFile)
				: null;
			await prisma.customEmoji.update({
				where: { id: submission.value.id },
				data: {
					url: file ? file.url : undefined,
					name: submission.value.name,
					aliases: submission.value.aliases?.split(' '),
				},
			});

			return {
				lastResult: submission.reply(),
				result: null,
			};
		}
	}
};

const ModalContent = ({
	closeModal,
	firstValues,
	isPatch,
}: {
	closeModal: () => void;
	firstValues?: z.infer<typeof schema>;
	isPatch?: boolean;
}) => {
	const fetcher = useFetcher<typeof action>();
	const [file, setFile] = useState<IUploadedFile | null>(null);

	type Fields = z.infer<typeof schema>;
	const [_, fields] = useForm<Fields>({
		onValidate({ formData }) {
			return parseWithZod(formData, { schema });
		},
		lastResult: fetcher.data?.lastResult,
		defaultValue: firstValues,
	});

	const { submit, uploadedFiles, isUploading } = useFileUpload();
	useEffect(() => {
		setFile(uploadedFiles[0]);
	}, [uploadedFiles]);

	useEffect(() => {
		if (fetcher.data && fetcher.data.lastResult.status === 'success') {
			closeModal();
		}
	}, [fetcher.data]);

	return (
		<fetcher.Form
			action="admin/emojis"
			method={isPatch ? 'PATCH' : 'POST'}
			encType="multipart/form-data"
		>
			{file && (
				<div className="mb-4 flex justify-center">
					<img
						src={file.url}
						alt=""
						key={file.fileId}
						className="h-20 w-20 rounded-lg border object-contain"
					/>
				</div>
			)}
			<div className="flex justify-center">
				<label htmlFor="emoji-file" className="cursor-pointer">
					<Button
						variant={'secondary'}
						className="rounded-full"
						type="button"
						onClick={() => document.getElementById('emoji-file')?.click()}
					>
						ファイルを選択
					</Button>
				</label>

				<input
					name={fields.file.name}
					type="file"
					id="emoji-file"
					accept="image/*, video/*"
					className="hidden"
					onChange={(event) => submit(event.target.files)}
				/>
			</div>

			<div className="mb-4 grid w-full max-w-sm items-center gap-1.5">
				<Label htmlFor="name">
					名前{' '}
					{fields.name.errors && (
						<span className="text-red-500">{fields.name.errors}</span>
					)}
				</Label>
				<Input
					defaultValue={fields.name.value}
					type="text"
					id="name"
					name={fields.name.name}
					placeholder="名前"
				/>
			</div>
			<div className="mb-4 grid w-full max-w-sm items-center gap-1.5">
				<Label htmlFor="aliases">
					エイリアス{' '}
					{fields.aliases.errors && (
						<span className="text-red-500">{fields.aliases.errors}</span>
					)}
				</Label>
				<Input
					type="text"
					id="aliases"
					defaultValue={fields.aliases.value}
					name={fields.aliases.name}
					placeholder="エイリアス"
				/>
				<p className="text-gray-500 text-sm">
					カスタム絵文字を検索する際のキーワードです。スペースで区切って複数設定できます。
				</p>
			</div>

			<Button type="submit" className="bg-blue-400 hover:bg-blue-500">
				Submit
			</Button>
		</fetcher.Form>
	);
};

export default function Index() {
	const { emojis } = useLoaderData<typeof loader>();
	const { openModal, closeModal } = useModal();

	const handleOpenModal = () => {
		openModal(<ModalContent closeModal={closeModal} />);
	};

	const handleOpenEditModal = (emoji: CustomEmoji) => {
		openModal(
			<ModalContent
				closeModal={closeModal}
				firstValues={{
					file: JSON.stringify({ url: emoji.url, fileId: emoji.id }),
					name: emoji.name,
					aliases: emoji.aliases.join(' '),
				}}
				isPatch
			/>,
		);
	};

	return (
		<div>
			<button
				onClick={handleOpenModal}
				onKeyDown={handleOpenModal}
				type="button"
				className="flex items-center gap-2 rounded-lg bg-blue-400 px-4 py-2 text-white hover:bg-blue-500 ml-auto"
			>
				新規追加
				<TbPlus />
			</button>
			<LayoutGroup>
				<div id="emoji-list" className="flex flex-wrap gap-4">
					{emojis?.map((emoji) => (
						<motion.div
							key={emoji.id}
							layoutId={emoji.id}
							className="flex w-full cursor-pointer  p-4 md:w-[20%]"
							onClick={() => handleOpenEditModal(emoji)}
							onKeyDown={() => handleOpenEditModal(emoji)}
						>
							<motion.img
								src={emoji.url}
								alt={emoji.name}
								className="h-10 w-10 object-contain"
								layoutId={`image-${emoji.id}`}
							/>
							<motion.p layoutId={`name-${emoji.id}`} className="truncate">
								{emoji.name}
							</motion.p>
						</motion.div>
					))}
				</div>
			</LayoutGroup>
		</div>
	);
}

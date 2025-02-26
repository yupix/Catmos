import { useCallback, useMemo } from 'react';
import { useFetcher } from 'react-router';
import { v4 as uuidV4 } from 'uuid';

/**
 * ファイルアップロードを管理するカスタムフック
 * @returns {object} ファイルアップロードの状態と関数
 */
export const useFileUpload = () => {
	const { submit, data, state, formData } = useFetcher();
	const isUploading = state !== 'idle';

	// アップロード中のファイルを取得
	const uploadingFiles = useMemo(() => {
		return formData
			?.getAll('files')
			.filter((file: unknown): file is File => file instanceof File)
			.map((file) => ({
				name: file.name,
				url: URL.createObjectURL(file),
			}));
	}, [formData]);

	// アップロード済みのファイルとアップロード中のファイルを結合
	const images = useMemo(() => {
		return (data ?? []).concat(uploadingFiles ?? []);
	}, [data, uploadingFiles]);

	/**
	 * ファイルをアップロードする関数
	 * @param {FileList | null} files - アップロードするファイルリスト
	 */
	const handleFileUpload = useCallback(
		(files: FileList | null) => {
			if (!files) return;
			const form = new FormData();
			for (const file of files) form.append('files', file);
			submit(form, {
				method: 'POST',
				action: `/upload/${uuidV4()}`,
				encType: 'multipart/form-data',
			});
		},
		[submit],
	);

	return {
		submit: handleFileUpload,
		isUploading,
		images,
	};
};

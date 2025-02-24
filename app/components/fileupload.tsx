import { useEffect, useRef, useState } from 'react';
import { Form } from 'react-router';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/shadcn/ui/dropdown-menu';

interface FileUploadProps {
	children: React.ReactNode;
	asChild?: boolean;
	action: string;
	intent?: string;
}

export function FileUpload({
	children,
	asChild,
	action,
	intent,
}: FileUploadProps) {
	const form = useRef<HTMLFormElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);

	const handleSubmit = () => {
		if (!form.current) {
			return;
		}
		form.current.submit();
		setIsOpen(false);
	};

	const handleClick = () => {
		setIsOpen((prev) => !prev);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	return (
		<DropdownMenu open={isOpen}>
			<DropdownMenuTrigger asChild={asChild} onClick={handleClick}>
				{children}
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" ref={dropdownRef}>
				<DropdownMenuGroup>
					<Form
						action={action}
						ref={form}
						method="POST"
						encType="multipart/form-data"
					>
						<input type="hidden" name="intent" value={intent} />
						<DropdownMenuItem className="p-0">
							<>
								<label
									htmlFor="file-upload"
									className="h-full w-full px-2 py-1.5 cursor-pointer"
								>
									アップロード
								</label>
								<input
									id="file-upload"
									type="file"
									name="file"
									className="hidden"
									accept="image/*"
									onChange={handleSubmit}
								/>
							</>
						</DropdownMenuItem>
						{/* <DropdownMenuItem>ドライブから</DropdownMenuItem> */}
						<DropdownMenuItem>URLから</DropdownMenuItem>
					</Form>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

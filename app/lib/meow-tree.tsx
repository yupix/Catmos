import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface TreeNode {
	type: string;
	content?: string;
	children?: TreeNode[];
}

const parseContentToTree = (content: string): TreeNode[] => {
	const mentionRegex = /@(\p{L}+)/gu;
	const linkRegex = /(https?:\/\/[^\s]+)/g;
	const boldRegex = /\*\*(.*?)\*\*/g;
	const italicRegex = /\*(.*?)\*/g;

	const parts = content.split(/(@\w+|https?:\/\/[^\s]+|\*\*.*?\*\*|\*.*?\*)/g);

	return parts.map((part) => {
		if (mentionRegex.test(part)) {
			return { type: 'mention', content: part };
		}
		if (linkRegex.test(part)) {
			return { type: 'link', content: part };
		}
		if (boldRegex.test(part)) {
			return { type: 'bold', content: part.replace(/\*\*/g, '') };
		}
		if (italicRegex.test(part)) {
			return { type: 'italic', content: part.replace(/\*/g, '') };
		}
		return { type: 'text', content: part };
	});
};

export const parseTextToTree = (text: string): TreeNode[] => {
	const lines = text.split('\n');
	const root: TreeNode[] = [];
	let currentNode: TreeNode | null = null;

	for (const line of lines) {
		if (line.startsWith('#')) {
			currentNode = { type: 'header', content: line, children: [] };
			root.push(currentNode);
		} else if (currentNode) {
			if (line.trim() === '') {
				currentNode.children?.push({ type: 'newline' });
			} else {
				currentNode.children?.push({ type: 'paragraph', content: line });
			}
		} else {
			if (line.trim() === '') {
				root.push({ type: 'newline' });
			} else {
				root.push({ type: 'paragraph', content: line });
			}
		}
	}

	return root;
};

export const renderTree = (nodes: TreeNode[]) => {
	return nodes.map((node, index) => {
		switch (node.type) {
			case 'header':
				return (
					<div key={index} style={{ fontWeight: 'bold' }}>
						{renderTree(parseContentToTree(node.content || ''))}
						{node.children && renderTree(node.children)}
					</div>
				);
			case 'paragraph':
				return (
					<div key={index}>
						{renderTree(parseContentToTree(node.content || ''))}
					</div>
				);
			case 'mention':
				return (
					<span
						key={index}
						className="bg-blue-100 text-blue-500 p-1 rounded-full"
					>
						{node.content}
					</span>
				);
			case 'link':
				return (
					<a key={index} href={node.content} style={{ color: 'blue' }}>
						{node.content}
					</a>
				);
			case 'bold':
				return <strong key={index}>{node.content}</strong>;
			case 'italic':
				return <em key={index}>{node.content}</em>;
			case 'text':
				return <span key={index}>{node.content}</span>;
			case 'newline':
				return <br key={index} />;
			default:
				return null;
		}
	});
};

interface MeowTreeProps {
	handleSubmit: (text: string) => void;
}

const MeowTree = ({ handleSubmit }: MeowTreeProps) => {
	const [text, setText] = useState('');
	const [tree, setTree] = useState<TreeNode[]>([]);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.focus();
		}
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const parsedTree = parseTextToTree(e.target.value);
		setTree(parsedTree);
		setText(e.target.value);
	};

	return (
		<>
			<div className="max-w-md">
				<textarea
					ref={textareaRef}
					name="text"
					onChange={handleChange}
					value={text}
					onKeyDown={(e) => {
						console.log(e.key, e.metaKey, e.ctrlKey);
						if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
							// e.preventDefault();
							handleSubmit(text);
							setText('');
						}
					}}
					className="mb-4 h-20 w-full resize-none whitespace-pre-wrap focus:outline-none"
				/>
			</div>
			<div className="max-w-md break-words break-all">{renderTree(tree)}</div>
		</>
	);
};

export default MeowTree;

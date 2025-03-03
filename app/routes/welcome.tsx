import { Link } from 'react-router';
import { Button } from '~/components/shadcn/ui/button';

export default function Index() {
	return (
		<div className="container mx-auto flex h-screen items-center justify-center">
			<div className="flex flex-col items-center gap-4 md:flex-row">
				<img
					src="https://s3.akarinext.org/catmos/*%2Fc3c93d79-f624-4a4e-b371-e2cf9acd8f9e.png"
					alt="CatMos Logo"
					width={200}
				/>
				<div>
					<div className="mb-4">
						<h1 className="font-bold text-2xl">CatMos</h1>

						<p>CatMosは誰でも簡単に使用することができるSNSです。</p>
					</div>

					<Button asChild>
						<Link to="/auth/login">ログイン</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}

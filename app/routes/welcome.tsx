import { Link } from 'react-router';
import { Button } from '~/components/shadcn/ui/button';

export default function Index() {
	return (
		<div className="flex h-screen w-screen items-center">
			<div>
				<h1>CatMos</h1>
				<p>CatMosは誰でも簡単に使用することができるSNSです。</p>

				<Button asChild>
					<Link to="/auth/login">ログイン</Link>
				</Button>
			</div>
		</div>
	);
}

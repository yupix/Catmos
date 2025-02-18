import { IconHome } from 'react-icons/tb';
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuList,
} from './shadcn/ui/navigation-menu';

export function Header() {
	return (
		// biome-ignore lint/nursery/useSortedClasses: <explanation>
		<NavigationMenu className="sticky top-0 mx-auto max-w-[min(1200px,90%)] rounded-2xl border shadow-xs p-4">
			<NavigationMenuList>
				<NavigationMenuItem>
					<div className="flex">
						<IconHome stroke={2} /> タイムライン
					</div>
				</NavigationMenuItem>
				<NavigationMenuItem>通知</NavigationMenuItem>
				<NavigationMenuItem>Item3</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}

import {createSharedPathnamesNavigation} from 'next-intl/navigation';
import {locales} from './config';

// Should only be used on public routes in the `[locale]` segment
export const {Link, usePathname} = createSharedPathnamesNavigation({locales});

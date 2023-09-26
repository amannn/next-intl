import {createSharedPathnamesNavigation} from 'next-intl/navigation';

export const locales = ['en', 'de'] as const;
export const {Link} = createSharedPathnamesNavigation({locales});

import {createSharedPathnamesNavigation} from 'next-intl/navigation';
import {defineRouting} from 'next-intl/routing';
import {locales, defaultLocale} from '../config';

export const routing = defineRouting({
  locales,
  defaultLocale
});

// Should only be used on public routes in the `[locale]` segment
export const {Link, usePathname} = createSharedPathnamesNavigation(routing);

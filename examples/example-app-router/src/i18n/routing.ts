import {createLocalizedPathnamesNavigation} from 'next-intl/navigation';
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'de', 'enAU', 'en_US'],
  defaultLocale: 'en',
  pathnames: {
    '/': '/',
    '/pathnames': {
      en: '/pathnames',
      de: '/pfadnamen',
      enAU: '/pathnames',
      en_US: '/pathnames'
    }
  }
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];

export const {Link, getPathname, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation(routing);

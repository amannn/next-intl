import {createNavigation} from 'next-intl/navigation';
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'de'],
  defaultLocale: 'en',
  pathnames: {
    '/': '/',
    '/pathnames': {
      de: '/pfadnamen'
    }
  }
});

export const {Link, getPathname, redirect, usePathname, useRouter} =
  createNavigation(routing);

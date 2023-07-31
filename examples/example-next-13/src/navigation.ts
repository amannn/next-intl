import {
  createLocalizedPathnamesNavigation,
  Pathnames
} from 'next-intl/navigation';

export const locales = ['en', 'de'] as const;

export const pathnames: Pathnames<typeof locales> = {
  '/': '/',
  '/about': {
    en: '/about',
    de: '/ueber'
  }
} as const;

export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({
    locales,
    pathnames
  });

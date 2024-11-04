import {createSharedPathnamesNavigation} from 'next-intl/navigation';

export const {Link, permanentRedirect, redirect, usePathname, useRouter} =
  createSharedPathnamesNavigation({
    locales: ['en'],
    defaultLocale: 'en'
  });

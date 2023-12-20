import {
  createLocalizedPathnamesNavigation,
  Pathnames
} from 'next-intl/navigation';

export const defaultLocale = 'en';

export const locales = ['en', 'de', 'es'] as const;

export const localePrefix = 'as-needed';

export const pathnames = {
  '/': '/',
  '/client': '/client',
  '/client/redirect': '/client/redirect',
  '/nested': {
    en: '/nested',
    de: '/verschachtelt',
    es: '/anidada'
  },
  '/redirect': '/redirect',
  '/news/[articleId]': {
    en: '/news/[articleId]',
    de: '/neuigkeiten/[articleId]',
    es: '/noticias/[articleId]'
  }
} satisfies Pathnames<typeof locales>;

export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({
    locales,
    localePrefix,
    pathnames
  });

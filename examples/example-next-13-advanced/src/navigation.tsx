import {
  createLocalizedPathnamesNavigation,
  Pathnames
} from 'next-intl/navigation';

export const locales = ['en', 'de', 'es'] as const;

export const pathnames: Pathnames<typeof locales> = {
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
} as const;

export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({
    locales,
    pathnames
  });

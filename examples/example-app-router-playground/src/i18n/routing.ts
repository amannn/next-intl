import {createNavigation} from 'next-intl/navigation';
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'de', 'es', 'ja'],
  defaultLocale: 'en',
  localePrefix:
    process.env.NEXT_PUBLIC_USE_CASE === 'locale-prefix-never'
      ? 'never'
      : {
          mode: 'as-needed',
          prefixes: {
            es: '/spain'
          }
        },
  domains:
    process.env.NEXT_PUBLIC_USE_CASE === 'domains'
      ? [
          {
            domain: 'example.com',
            defaultLocale: 'en'
          },
          {
            domain: 'example.de',
            defaultLocale: 'de'
          }
        ]
      : undefined,
  pathnames: {
    '/': '/',
    '/client': '/client',
    '/about': '/about',
    '/client/redirect': '/client/redirect',
    '/nested': {
      en: '/nested',
      de: '/verschachtelt',
      es: '/anidada',
      ja: '/ネスト'
    },
    '/redirect': '/redirect',
    '/news/[articleId]': {
      en: '/news/[articleId]',
      de: '/neuigkeiten/[articleId]',
      es: '/noticias/[articleId]',
      ja: '/ニュース/[articleId]'
    },
    '/news/just-in': {
      en: '/news/just-in',
      de: '/neuigkeiten/aktuell',
      es: '/noticias/justo-en',
      ja: '/ニュース/現在'
    }
  }
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];

export const {Link, getPathname, redirect, usePathname, useRouter} =
  createNavigation(routing);

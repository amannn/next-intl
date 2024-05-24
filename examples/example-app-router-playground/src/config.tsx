import {Pathnames} from 'next-intl/navigation';

export const defaultLocale = 'en';

export const locales = ['en', 'de', 'es', 'ja'] as const;

export const localePrefix =
  process.env.NEXT_PUBLIC_LOCALE_PREFIX === 'never' ? 'never' : 'as-needed';

export const pathnames = {
  '/': '/',
  '/client': '/client',
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
} satisfies Pathnames<typeof locales>;

import {Pathnames, LocalePrefix} from 'next-intl/routing';

export const defaultLocale = 'en' as const;
export const locales = ['en', 'de'] as const;

export const pathnames = {
  '/': '/',
  '/pathnames': {
    en: '/pathnames',
    de: '/pfadnamen'
  },
  '/users/[id]': {
    en: '/users/[id]',
    de: '/benutzer/[id]'
  }
} satisfies Pathnames<typeof locales>;

export const localePrefix: LocalePrefix<typeof locales> = 'always';

export const port = process.env.PORT || 3000;
export const host = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${port}`;

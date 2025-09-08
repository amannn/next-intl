import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'de', 'en-DE'],
  defaultLocale: 'en',
  pathnames: {
    '/': '/',
    '/pathnames': {
      de: '/pfadnamen'
    }
  },
  localePrefix: {
    mode: 'always',
    prefixes: {
      'en-DE': '/de/en'
    }
  }
});

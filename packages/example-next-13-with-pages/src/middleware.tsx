import {createIntlMiddleware} from 'next-intl/server';

export default createIntlMiddleware({
  locales: ['en', 'de'],
  defaultLocale: 'en'
});

export const config = {
  // Skip all internal paths
  matcher: ['/((?!_next).*)']
};

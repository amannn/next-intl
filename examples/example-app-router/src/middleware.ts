import createMiddleware from 'next-intl/middleware';
import {pathnames, locales, localePrefix} from './config';

export default createMiddleware({
  defaultLocale: 'en',
  locales,
  pathnames,
  localePrefix
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/('+locales.join('|')+')/:path*']
};

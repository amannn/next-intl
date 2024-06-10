import createMiddleware from 'next-intl/middleware';
import {locales, pathnames, localePrefix} from './navigation';

export default createMiddleware({
  defaultLocale: 'en',
  localePrefix,
  pathnames,
  locales
});

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!_next|.*\\..*).*)']
};

import createMiddleware from 'next-intl/middleware';
import {locales, pathnames, localePrefix, defaultLocale} from './config';

export default createMiddleware({
  defaultLocale,
  localePrefix,
  pathnames,
  locales
});

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!_next|.*\\..*).*)']
};

import createMiddleware from 'next-intl/middleware';
import {locales, pathnames} from './navigation';

export default createMiddleware({
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  pathnames,
  locales
});

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!_next|.*\\..*).*)']
};

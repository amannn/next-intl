import createMiddleware from 'next-intl/middleware';
import {locales, localePrefix, defaultLocale} from './navigation';

export default createMiddleware({
  defaultLocale,
  locales,
  localePrefix
});

export const config = {
  matcher: ['/', '/(en)/:path*']
};

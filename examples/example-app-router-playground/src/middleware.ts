import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing, {
  localeCookie:
    process.env.NEXT_PUBLIC_USE_CASE === 'locale-cookie-false'
      ? false
      : {
          // 200 days
          maxAge: 200 * 24 * 60 * 60
        }
});

export const config = {
  matcher: [
    // Skip all paths that should not be internationalized
    '/((?!_next|.*\\..*).*)',

    // Necessary for base path to work
    '/'
  ]
};

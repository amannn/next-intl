import createMiddleware from 'next-intl/middleware';
import {locales} from './navigation';

export default createMiddleware({
  locales,
  defaultLocale: 'en'
});

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

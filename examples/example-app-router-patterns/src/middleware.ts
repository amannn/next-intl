import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, the `/design` reference page and files
  matcher: ['/((?!api|_next|design|.*\\..*).*)']
};

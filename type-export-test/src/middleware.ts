import createMiddleware from 'next-intl/middleware';
import {routing} from './routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Skip all paths that should not be internationalized
    '/((?!_next|.*\\..*).*)',

    // Necessary for base path to work
    '/'
  ]
};

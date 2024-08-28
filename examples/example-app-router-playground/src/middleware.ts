import createMiddleware from 'next-intl/middleware';
import {routing} from './routing';

export default createMiddleware(routing);

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!_next|.*\\..*).*)']
};

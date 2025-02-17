import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Only match content pages by excluding:
    // - Next.js internals at /_next
    // - Vercel internals at /_vercel
    // - Pathnames that look like static files
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};

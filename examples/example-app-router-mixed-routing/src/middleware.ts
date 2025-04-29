import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing.public';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - … if they start with `/app`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!app|_next|_vercel|.*\\..*).*)'
};

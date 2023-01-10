import {NextRequest, NextResponse} from 'next/server';
import {COOKIE_LOCALE_NAME, HEADER_CONFIG_NAME} from '../shared/constants';
import ServerRuntimeSerializer from './ServerRuntimeSerializer';
import resolveLocale from './resolveLocale';
import staticConfig from './staticConfig';

// If there's an exact match for this path, we'll add the locale to the URL
const ROOT_URL = '/';

export default function createIntlMiddleware(opts?: {
  now?: Date;
  timeZone?: string;
}) {
  const now = opts?.now ?? new Date();
  const timeZone = opts?.timeZone;

  const i18n = {
    locales: staticConfig.locales,
    defaultLocale: staticConfig.defaultLocale
  };

  return function middleware(request: NextRequest) {
    // Ideally we could use the `headers()` and `cookies()` API here
    // as well, but they are currently not available in middleware.
    const locale = resolveLocale(
      i18n,
      request.headers,
      request.cookies,
      request.nextUrl.pathname
    );

    const isUnknownLocale = !request.nextUrl.pathname.startsWith('/' + locale);
    const isAtRoot = request.nextUrl.pathname === ROOT_URL;
    const shouldRedirect = isUnknownLocale || isAtRoot;

    let response;
    if (shouldRedirect) {
      response = NextResponse.redirect(new URL(ROOT_URL + locale, request.url));
    } else {
      response = NextResponse.next({
        request: {
          headers: new Headers({
            [HEADER_CONFIG_NAME]: ServerRuntimeSerializer.serialize({
              locale,
              now,
              timeZone
            })
          })
        }
      });
    }

    response.cookies.set(COOKIE_LOCALE_NAME, locale);

    return response;
  };
}

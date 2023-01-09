import {NextRequest, NextResponse} from 'next/server';
import {HEADER_CONFIG_NAME} from '../shared/constants';
import NextIntlServerRuntime from './NextIntlServerRuntime';
import resolveLocale from './resolveLocale';
import staticConfig from './staticConfig';

// If there's an exact match for this path, we'll add the locale to the URL
const REDIRECT_URL = '/';

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

    let response;
    if (request.nextUrl.pathname === REDIRECT_URL) {
      response = NextResponse.redirect(
        new URL(REDIRECT_URL + locale, request.url)
      );
    } else {
      response = NextResponse.next({
        request: {
          headers: new Headers({
            [HEADER_CONFIG_NAME]: NextIntlServerRuntime.serialize({
              locale,
              now,
              timeZone
            })
          })
        }
      });
    }

    return response;
  };
}

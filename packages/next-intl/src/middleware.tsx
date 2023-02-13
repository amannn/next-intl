import {NextRequest, NextResponse} from 'next/server';
import NextIntlMiddlewareConfig from './server/NextIntlMiddlewareConfig';
import resolveLocale from './server/resolveLocale';
import {COOKIE_LOCALE_NAME, HEADER_LOCALE_NAME} from './shared/constants';

// If there's an exact match for this path, we'll add the locale to the URL
const ROOT_URL = '/';

export default function createIntlMiddleware({
  defaultLocale,
  locales
}: NextIntlMiddlewareConfig) {
  const i18n = {
    locales,
    defaultLocale
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

    const isRoot = request.nextUrl.pathname === ROOT_URL;
    const isChangingLocale =
      request.cookies.get(COOKIE_LOCALE_NAME)?.value !== locale;

    let response;
    if (isRoot) {
      response = NextResponse.redirect(new URL(ROOT_URL + locale, request.url));
    } else {
      let responseInit;

      // Only apply a header if absolutely necessary
      // as this causes full page reloads
      if (isChangingLocale) {
        request.headers.set(HEADER_LOCALE_NAME, locale);

        responseInit = {
          request: {
            headers: request.headers
          }
        };
      }

      response = NextResponse.next(responseInit);
    }

    if (isChangingLocale) {
      response.cookies.set(COOKIE_LOCALE_NAME, locale);
    }

    return response;
  };
}

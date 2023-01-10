import {NextRequest, NextResponse} from 'next/server';
import {COOKIE_LOCALE_NAME, HEADER_LOCALE_NAME} from '../shared/constants';
import resolveLocale from './resolveLocale';
import staticConfig from './staticConfig';

// If there's an exact match for this path, we'll add the locale to the URL
const ROOT_URL = '/';

export default function createIntlMiddleware() {
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
    const isRoot = request.nextUrl.pathname === ROOT_URL;
    const shouldRedirect = isUnknownLocale || isRoot;
    const isChangingLocale =
      request.cookies.get(COOKIE_LOCALE_NAME)?.value !== locale;

    let response;
    if (shouldRedirect) {
      response = NextResponse.redirect(new URL(ROOT_URL + locale, request.url));
    } else {
      let responseInit;

      // Only apply a header if absolutely necessary
      // as this causes full page reloads
      if (isChangingLocale) {
        responseInit = {
          request: {
            headers: new Headers({
              [HEADER_LOCALE_NAME]: locale
            })
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

import {NextRequest, NextResponse} from 'next/server';
import NextIntlCookie from './NextIntlCookie';
import resolveLocale from './resolveLocale';
import staticConfig from './staticConfig';

// If there's an exact match for this path, we'll add the locale to the URL
const REDIRECT_URL = '/';

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

    // It seems like setting headers and cookies here doesn't affect what can
    // be read from RSC. If it did, we could use it to set the locale.
    //
    // request.headers.set('x-next-intl-locale', locale);
    // request.cookies.set('x-next-intl-locale', locale);

    let response;
    if (request.nextUrl.pathname === REDIRECT_URL) {
      response = NextResponse.redirect(
        new URL(REDIRECT_URL + locale, request.url)
      );
    } else {
      response = NextResponse.next();
    }

    new NextIntlCookie(response.cookies).setLocale(locale);

    return response;
  };
}

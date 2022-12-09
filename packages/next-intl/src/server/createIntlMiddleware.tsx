import {NextRequest, NextResponse} from 'next/server';
import NextI18nConfig from './NextI18nConfig';
import NextIntlCookie from './NextIntlCookie';
import resolveLocale from './resolveLocale';

// If there's an exact match for this path, we'll add the locale to the URL
const REDIRECT_URL = '/';

export default function createIntlMiddleware(i18n: NextI18nConfig) {
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
      response = NextResponse.next();
    }

    new NextIntlCookie(response.cookies).setLocale(locale);

    return response;
  };
}

import {NextRequest, NextResponse} from 'next/server';
import NextI18nConfig from '../I18nConfig';
import NextIntlCookie from './NextIntlCookie';
import resolveLocale from './resolveLocale';

export default function createMiddleware(i18n: NextI18nConfig) {
  return function middleware(request: NextRequest) {
    const locale = resolveLocale(
      i18n,
      request.headers,
      request.cookies,
      request.nextUrl.pathname
    );

    // Ideally we could use the `headers()` and `cookies()` API here as well.

    let response;
    if (request.nextUrl.pathname === '/') {
      response = NextResponse.redirect(new URL('/' + locale, request.url));
    } else {
      response = NextResponse.next();
    }

    new NextIntlCookie(response.cookies).setLocale(locale);

    return response;
  };
}

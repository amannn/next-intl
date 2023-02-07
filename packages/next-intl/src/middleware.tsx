import {NextRequest, NextResponse} from 'next/server';
import NextIntlMiddlewareConfig from './server/NextIntlMiddlewareConfig';
import resolveLocale from './server/resolveLocale';
import {COOKIE_LOCALE_NAME, HEADER_LOCALE_NAME} from './shared/constants';

const ROOT_URL = '/';

export default function createIntlMiddleware(config: NextIntlMiddlewareConfig) {
  return function middleware(request: NextRequest) {
    // Ideally we could use the `headers()` and `cookies()` API here
    // as well, but they are currently not available in middleware.
    const locale = resolveLocale(
      config,
      request.headers,
      request.cookies,
      request.nextUrl.pathname
    );

    const isRoot = request.nextUrl.pathname === ROOT_URL;
    const hasOutdatedCookie =
      request.cookies.get(COOKIE_LOCALE_NAME)?.value !== locale;
    const hasMatchedDefaultLocale = locale === config.defaultLocale;

    function getResponseInit() {
      let responseInit;

      if (hasOutdatedCookie) {
        // Only apply a header if absolutely necessary
        // as this causes full page reloads
        request.headers.set(HEADER_LOCALE_NAME, locale);
        responseInit = {
          request: {
            headers: request.headers
          }
        };
      }

      return responseInit;
    }

    function rewrite(url: string) {
      return NextResponse.rewrite(new URL(url, request.url), getResponseInit());
    }

    function next() {
      return NextResponse.next(getResponseInit());
    }

    function redirect(url: string) {
      return NextResponse.redirect(new URL(url, request.url));
    }

    let response;
    if (isRoot) {
      if (hasMatchedDefaultLocale) {
        response = rewrite(`/${locale}`);
      } else {
        response = redirect(`/${locale}`);
      }
    } else {
      const pathLocale = config.locales.find((cur) =>
        request.nextUrl.pathname.startsWith(`/${cur}`)
      );
      const hasLocalePrefix = pathLocale != null;

      if (hasLocalePrefix) {
        if (pathLocale === locale) {
          response = next();
        } else {
          const basePath = request.nextUrl.pathname.replace(
            `/${pathLocale}`,
            ''
          );
          response = redirect(`/${locale}${basePath}`);
        }
      } else {
        if (hasMatchedDefaultLocale) {
          response = rewrite(`/${locale}${request.nextUrl.pathname}`);
        } else {
          response = redirect(`/${locale}${request.nextUrl.pathname}`);
        }
      }
    }

    if (hasOutdatedCookie) {
      response.cookies.set(COOKIE_LOCALE_NAME, locale);
    }

    return response;
  };
}

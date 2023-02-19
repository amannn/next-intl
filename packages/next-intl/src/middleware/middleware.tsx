import {NextRequest, NextResponse} from 'next/server';
import {COOKIE_LOCALE_NAME, HEADER_LOCALE_NAME} from '../shared/constants';
import NextIntlMiddlewareConfig from './NextIntlMiddlewareConfig';
import resolveLocale from './resolveLocale';
import setAlternateLinksHeader from './setAlternateLinksHeader';

const ROOT_URL = '/';

export default function createIntlMiddleware(config: NextIntlMiddlewareConfig) {
  return function middleware(request: NextRequest) {
    const {domain, locale} = resolveLocale(
      config,
      request.headers,
      request.cookies,
      request.nextUrl.pathname
    );

    const isRoot = request.nextUrl.pathname === ROOT_URL;
    const hasOutdatedCookie =
      request.cookies.get(COOKIE_LOCALE_NAME)?.value !== locale;
    const hasMatchedDefaultLocale = domain
      ? domain.defaultLocale === locale
      : locale === config.defaultLocale;

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
      let pathWithSearch = `/${locale}`;
      if (request.nextUrl.search) {
        pathWithSearch += request.nextUrl.search;
      }

      if (hasMatchedDefaultLocale) {
        response = rewrite(pathWithSearch);
      } else {
        response = redirect(pathWithSearch);
      }
    } else {
      const pathLocale = config.locales.find((cur) =>
        request.nextUrl.pathname.startsWith(`/${cur}`)
      );
      const hasLocalePrefix = pathLocale != null;

      let pathWithSearch = request.nextUrl.pathname;
      if (request.nextUrl.search) {
        pathWithSearch += request.nextUrl.search;
      }

      if (hasLocalePrefix) {
        if (pathLocale === locale) {
          response = next();
        } else {
          const basePath = pathWithSearch.replace(`/${pathLocale}`, '');
          response = redirect(`/${locale}${basePath}`);
        }
      } else {
        if (hasMatchedDefaultLocale) {
          response = rewrite(`/${locale}${pathWithSearch}`);
        } else {
          response = redirect(`/${locale}${pathWithSearch}`);
        }
      }
    }

    if (hasOutdatedCookie) {
      response.cookies.set(COOKIE_LOCALE_NAME, locale);
    }

    if ((config.alternateLinks ?? true) && config.locales.length > 1) {
      setAlternateLinksHeader(config, request, response);
    }

    return response;
  };
}

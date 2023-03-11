import {NextRequest, NextResponse} from 'next/server';
import {COOKIE_LOCALE_NAME, HEADER_LOCALE_NAME} from '../shared/constants';
import NextIntlMiddlewareConfig, {
  NextIntlMiddlewareConfigWithDefaults
} from './NextIntlMiddlewareConfig';
import getAlternateLinksHeaderValue from './getAlternateLinksHeaderValue';
import resolveLocale from './resolveLocale';

const ROOT_URL = '/';

function receiveConfig(
  config: NextIntlMiddlewareConfig
): NextIntlMiddlewareConfigWithDefaults {
  const result = {
    ...config,
    alternateLinks: config.alternateLinks ?? true
  };

  if (!result.routing) {
    result.routing = {
      type: 'prefix'
    };
  }

  if (result.routing.type === 'prefix') {
    result.routing.prefix = result.routing.prefix ?? 'as-necessary';
  }

  return result as NextIntlMiddlewareConfigWithDefaults;
}

export default function createIntlMiddleware(config: NextIntlMiddlewareConfig) {
  // TODO: Remove before stable release
  if (config.domains != null) {
    console.error(
      'The `domains` option is deprecated. Please use `routing` instead.'
    );
    config = {
      ...config,
      routing: {
        type: 'domain',
        domains: config.domains.map((cur) => ({
          domain: cur.domain,
          locale: cur.defaultLocale
        }))
      }
    };
    delete config.domains;
  }

  const configWithDefaults = receiveConfig(config);

  if (configWithDefaults.routing.type === 'domain') {
    const {domains} = configWithDefaults.routing;
    const hasMatchingDomainForEveryLocale = configWithDefaults.locales.every(
      (locale) => domains.find((cur) => cur.locale === locale) != null
    );
    if (!hasMatchingDomainForEveryLocale) {
      throw new Error('Every locale must have a matching domain');
    }
  }

  return function middleware(request: NextRequest) {
    const {domain, locale} = resolveLocale(
      configWithDefaults,
      request.headers,
      request.cookies,
      request.nextUrl.pathname
    );

    const isRoot = request.nextUrl.pathname === ROOT_URL;
    const hasOutdatedCookie =
      request.cookies.get(COOKIE_LOCALE_NAME)?.value !== locale;
    const hasMatchedDefaultLocale = domain
      ? domain.locale === locale
      : locale === configWithDefaults.defaultLocale;
    const domainConfigs =
      configWithDefaults.routing.type === 'domain'
        ? configWithDefaults.routing.domains.filter(
            (cur) => cur.locale === locale
          ) ?? []
        : [];

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

    function redirect(url: string, host?: string) {
      const urlObj = new URL(url, request.url);

      if (domainConfigs.length > 0) {
        urlObj.pathname = url.replace(`/${locale}`, '');
        if (domainConfigs[0].domain && !host) {
          host = domainConfigs[0].domain;
        }
      }
      if (host) {
        urlObj.host = host;
      }

      return NextResponse.redirect(urlObj.toString());
    }

    let response;
    if (isRoot) {
      let pathWithSearch = `/${locale}`;
      if (request.nextUrl.search) {
        pathWithSearch += request.nextUrl.search;
      }

      if (
        hasMatchedDefaultLocale &&
        ((configWithDefaults.routing.type === 'prefix' &&
          configWithDefaults.routing.prefix === 'as-necessary') ||
          configWithDefaults.routing.type === 'domain')
      ) {
        response = rewrite(pathWithSearch);
      } else {
        response = redirect(pathWithSearch);
      }
    } else {
      const pathLocale = configWithDefaults.locales.find((cur) =>
        request.nextUrl.pathname.startsWith(`/${cur}`)
      );
      const hasLocalePrefix = pathLocale != null;

      let pathWithSearch = request.nextUrl.pathname;
      if (request.nextUrl.search) {
        pathWithSearch += request.nextUrl.search;
      }

      if (hasLocalePrefix) {
        const basePath = pathWithSearch.replace(`/${pathLocale}`, '') || '/';

        if (configWithDefaults.routing.type === 'domain') {
          const pathDomain = configWithDefaults.routing.domains.find(
            (cur) => pathLocale === cur.locale
          );

          response = redirect(basePath, pathDomain?.domain);
        } else {
          if (pathLocale === locale) {
            if (
              hasMatchedDefaultLocale &&
              configWithDefaults.routing.prefix === 'as-necessary'
            ) {
              response = redirect(basePath);
            } else {
              response = next();
            }
          } else {
            response = redirect(`/${locale}${basePath}`);
          }
        }
      } else {
        if (
          hasMatchedDefaultLocale &&
          ((configWithDefaults.routing.type === 'prefix' &&
            configWithDefaults.routing.prefix === 'as-necessary') ||
            configWithDefaults.routing.type === 'domain')
        ) {
          response = rewrite(`/${locale}${pathWithSearch}`);
        } else {
          response = redirect(`/${locale}${pathWithSearch}`);
        }
      }
    }

    if (hasOutdatedCookie) {
      response.cookies.set(COOKIE_LOCALE_NAME, locale);
    }

    if (
      configWithDefaults.alternateLinks &&
      configWithDefaults.locales.length > 1
    ) {
      response.headers.set(
        'Link',
        getAlternateLinksHeaderValue(configWithDefaults, request)
      );
    }

    return response;
  };
}

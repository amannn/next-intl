import {NextRequest, NextResponse} from 'next/server';
import {COOKIE_LOCALE_NAME, HEADER_LOCALE_NAME} from '../shared/constants';
import MiddlewareConfig, {
  MiddlewareConfigWithDefaults
} from './NextIntlMiddlewareConfig';
import getAlternateLinksHeaderValue from './getAlternateLinksHeaderValue';
import resolveLocale from './resolveLocale';
import {
  getBestMatchingDomain,
  getLocaleFromPathname,
  isLocaleSupportedOnDomain
} from './utils';

const ROOT_URL = '/';

function handleConfigDeprecations(config: MiddlewareConfig) {
  if (config.routing) {
    const {routing} = config;
    config = {...config};
    delete config.routing;

    if (routing.type === 'prefix') {
      config.localePrefix = routing.prefix;
    } else if (routing.type === 'domain') {
      config.domains = routing.domains.map((cur) => ({
        domain: cur.domain,
        defaultLocale: cur.locale,
        locales: [cur.locale]
      }));
    }

    console.error(
      "\n\nThe `routing` option is deprecated, please use `localePrefix` and `domains` instead. Here's your updated configuration:\n\n" +
        JSON.stringify(config, null, 2) +
        '\n\nThank you so much for following along with the Server Components beta and sorry for the inconvenience!\n\n'
    );
  }

  if (config.domains) {
    const {domains} = config;
    config = {...config};
    config.domains = domains.map((cur) => {
      if (cur.locale) {
        console.error(
          '\n\nThe `domain.locale` option is deprecated, please use `domain.defaultLocale` instead.'
        );
      }
      return {
        ...cur,
        defaultLocale: cur.locale || cur.defaultLocale,
        ...(cur.locale && {locales: [cur.locale]})
      };
    });
  }

  return config;
}

function receiveConfig(config: MiddlewareConfig) {
  // TODO: Remove before stable release
  config = handleConfigDeprecations(config);

  const result: MiddlewareConfigWithDefaults = {
    ...config,
    alternateLinks: config.alternateLinks ?? true,
    localePrefix: config.localePrefix ?? 'as-needed',
    localeDetection: config.localeDetection ?? true
  };

  return result;
}

export default function createMiddleware(config: MiddlewareConfig) {
  const configWithDefaults = receiveConfig(config);

  // Currently only in use to enable a seamless upgrade path from the
  // `{createIntlMiddleware} from 'next-intl/server'` API.
  const matcher: Array<string> | undefined = (config as any)._matcher;

  return function middleware(request: NextRequest) {
    const matches =
      !matcher ||
      matcher.some((pattern) => request.nextUrl.pathname.match(pattern));
    if (!matches) return NextResponse.next();

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
      ? domain.defaultLocale === locale
      : locale === configWithDefaults.defaultLocale;

    const domainConfigs =
      configWithDefaults.domains?.filter((curDomain) =>
        isLocaleSupportedOnDomain(locale, curDomain)
      ) || [];
    const hasUnknownHost = configWithDefaults.domains != null && !domain;

    function getResponseInit() {
      const responseInit = {
        request: {
          headers: request.headers
        }
      };

      if (hasOutdatedCookie) {
        responseInit.request.headers = new Headers(
          responseInit.request.headers
        );
        responseInit.request.headers.set(HEADER_LOCALE_NAME, locale);
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
        if (!host) {
          const bestMatchingDomain = getBestMatchingDomain(
            domain,
            locale,
            domainConfigs
          );

          if (bestMatchingDomain) {
            host = bestMatchingDomain.domain;

            if (
              bestMatchingDomain.defaultLocale === locale &&
              configWithDefaults.localePrefix === 'as-needed'
            ) {
              urlObj.pathname = urlObj.pathname.replace(`/${locale}`, '');
            }
          }
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
        configWithDefaults.localePrefix === 'as-needed'
      ) {
        response = rewrite(pathWithSearch);
      } else {
        response = redirect(pathWithSearch);
      }
    } else {
      const pathLocaleCandidate = getLocaleFromPathname(
        request.nextUrl.pathname
      );
      const pathLocale = configWithDefaults.locales.includes(
        pathLocaleCandidate
      )
        ? pathLocaleCandidate
        : undefined;
      const hasLocalePrefix = pathLocale != null;

      let pathWithSearch = request.nextUrl.pathname;
      if (request.nextUrl.search) {
        pathWithSearch += request.nextUrl.search;
      }

      if (hasLocalePrefix) {
        const basePath = pathWithSearch.replace(`/${pathLocale}`, '') || '/';

        if (pathLocale === locale) {
          if (
            hasMatchedDefaultLocale &&
            configWithDefaults.localePrefix === 'as-needed'
          ) {
            response = redirect(basePath);
          } else {
            if (configWithDefaults.domains) {
              const pathDomain = getBestMatchingDomain(
                domain,
                pathLocale,
                domainConfigs
              );

              if (domain?.domain !== pathDomain?.domain && !hasUnknownHost) {
                response = redirect(basePath, pathDomain?.domain);
              } else {
                response = next();
              }
            } else {
              response = next();
            }
          }
        } else {
          response = redirect(`/${locale}${basePath}`);
        }
      } else {
        if (
          hasMatchedDefaultLocale &&
          (configWithDefaults.localePrefix === 'as-needed' ||
            configWithDefaults.domains)
        ) {
          response = rewrite(`/${locale}${pathWithSearch}`);
        } else {
          response = redirect(`/${locale}${pathWithSearch}`);
        }
      }
    }

    if (hasOutdatedCookie) {
      response.cookies.set(COOKIE_LOCALE_NAME, locale, {
        sameSite: 'strict'
      });
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

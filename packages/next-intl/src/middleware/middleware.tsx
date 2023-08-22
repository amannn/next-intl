import {NextRequest, NextResponse} from 'next/server';
import {COOKIE_LOCALE_NAME, HEADER_LOCALE_NAME} from '../shared/constants';
import {AllLocales} from '../shared/types';
import {matchesPathname} from '../shared/utils';
import MiddlewareConfig, {
  MiddlewareConfigWithDefaults
} from './NextIntlMiddlewareConfig';
import getAlternateLinksHeaderValue from './getAlternateLinksHeaderValue';
import resolveLocale from './resolveLocale';
import {
  getInternalTemplate,
  formatTemplatePathname,
  getBasePath,
  getBestMatchingDomain,
  getKnownLocaleFromPathname,
  getNormalizedPathname,
  getPathWithSearch,
  isLocaleSupportedOnDomain
} from './utils';

const ROOT_URL = '/';

function handleConfigDeprecations<Locales extends AllLocales>(
  config: MiddlewareConfig<Locales>
) {
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

function receiveConfig<Locales extends AllLocales>(
  config: MiddlewareConfig<Locales>
): MiddlewareConfigWithDefaults<Locales> {
  // TODO: Remove before stable release
  config = handleConfigDeprecations(config);

  const result: MiddlewareConfigWithDefaults<Locales> = {
    ...config,
    alternateLinks: config.alternateLinks ?? true,
    localePrefix: config.localePrefix ?? 'as-needed',
    localeDetection: config.localeDetection ?? true
  };

  return result;
}

export default function createMiddleware<Locales extends AllLocales>(
  config: MiddlewareConfig<Locales>
) {
  const configWithDefaults = receiveConfig(config);

  // Currently only in use to enable a seamless upgrade path from the
  // `{createIntlMiddleware} from 'next-intl/server'` API.
  // TODO: Remove in next major release.
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

    const normalizedPathname = getNormalizedPathname(
      request.nextUrl.pathname,
      configWithDefaults.locales
    );

    const pathLocale = getKnownLocaleFromPathname(
      request.nextUrl.pathname,
      configWithDefaults.locales
    );
    const hasLocalePrefix = pathLocale != null;

    let response;
    let internalTemplateName: string | undefined;

    let pathname = request.nextUrl.pathname;
    if (configWithDefaults.pathnames) {
      let resolvedTemplateLocale;
      [resolvedTemplateLocale = locale, internalTemplateName] =
        getInternalTemplate(configWithDefaults.pathnames, normalizedPathname);

      if (internalTemplateName) {
        const pathnameConfig =
          configWithDefaults.pathnames[internalTemplateName];
        const localeTemplate: string =
          typeof pathnameConfig === 'string'
            ? pathnameConfig
            : pathnameConfig[locale];

        if (matchesPathname(localeTemplate, normalizedPathname)) {
          pathname = formatTemplatePathname(
            normalizedPathname,
            localeTemplate,
            internalTemplateName,
            pathLocale
          );
        } else {
          const isDefaultLocale =
            configWithDefaults.defaultLocale === locale ||
            domain?.defaultLocale === locale;

          response = redirect(
            formatTemplatePathname(
              normalizedPathname,
              typeof pathnameConfig === 'string'
                ? pathnameConfig
                : pathnameConfig[resolvedTemplateLocale],
              localeTemplate,
              pathLocale || !isDefaultLocale ? locale : undefined
            )
          );
        }
      }
    }

    if (!response) {
      if (pathname === ROOT_URL) {
        const pathWithSearch = getPathWithSearch(
          `/${locale}`,
          request.nextUrl.search
        );

        if (
          configWithDefaults.localePrefix === 'never' ||
          (hasMatchedDefaultLocale &&
            configWithDefaults.localePrefix === 'as-needed')
        ) {
          response = rewrite(pathWithSearch);
        } else {
          response = redirect(pathWithSearch);
        }
      } else {
        const pathWithSearch = getPathWithSearch(
          pathname,
          request.nextUrl.search
        );

        if (hasLocalePrefix) {
          const basePath = getBasePath(pathWithSearch, pathLocale);

          if (configWithDefaults.localePrefix === 'never') {
            response = redirect(basePath);
          } else if (pathLocale === locale) {
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
                  response = rewrite(pathWithSearch);
                }
              } else {
                response = rewrite(pathWithSearch);
              }
            }
          } else {
            response = redirect(`/${locale}${basePath}`);
          }
        } else {
          if (
            configWithDefaults.localePrefix === 'never' ||
            (hasMatchedDefaultLocale &&
              (configWithDefaults.localePrefix === 'as-needed' ||
                configWithDefaults.domains))
          ) {
            response = rewrite(`/${locale}${pathWithSearch}`);
          } else {
            response = redirect(`/${locale}${pathWithSearch}`);
          }
        }
      }
    }

    if (hasOutdatedCookie) {
      response.cookies.set(COOKIE_LOCALE_NAME, locale, {
        sameSite: 'strict'
      });
    }

    if (
      configWithDefaults.localePrefix !== 'never' &&
      configWithDefaults.alternateLinks &&
      configWithDefaults.locales.length > 1
    ) {
      response.headers.set(
        'Link',
        getAlternateLinksHeaderValue({
          config: configWithDefaults,
          localizedPathnames:
            internalTemplateName != null
              ? configWithDefaults.pathnames?.[internalTemplateName]
              : undefined,
          requestUrl: request.url,
          resolvedLocale: locale
        })
      );
    }

    return response;
  };
}

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

function receiveConfig<Locales extends AllLocales>(
  config: MiddlewareConfig<Locales>
): MiddlewareConfigWithDefaults<Locales> {
  const result: MiddlewareConfigWithDefaults<Locales> = {
    locales: config.locales,
    defaultLocale: config.defaultLocale,
    domains: config.domains,
    pathnames: config.pathnames,
    alternateLinks: config.alternateLinks ?? true,
    localePrefix: config.localePrefix ?? 'always',
    localeDetection: config.localeDetection ?? true,
    rewrite:
      config.rewrite ??
      ((_, ...args) => Promise.resolve(NextResponse.rewrite(...args)))
  };

  return result;
}

export default function createMiddleware<Locales extends AllLocales>(
  config: MiddlewareConfig<Locales>
) {
  const configWithDefaults = receiveConfig(config);

  return async function middleware(request: NextRequest) {
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
      const headers = new Headers(request.headers);
      headers.set(HEADER_LOCALE_NAME, locale);
      return {request: {headers}};
    }

    function rewrite(url: string) {
      return configWithDefaults.rewrite(
        request,
        new URL(url, request.url),
        getResponseInit()
      );
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
          response = await rewrite(pathWithSearch);
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
                  response = await rewrite(pathWithSearch);
                }
              } else {
                response = await rewrite(pathWithSearch);
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
            response = await rewrite(`/${locale}${pathWithSearch}`);
          } else {
            response = redirect(`/${locale}${pathWithSearch}`);
          }
        }
      }
    }

    if (hasOutdatedCookie) {
      response.cookies.set(COOKIE_LOCALE_NAME, locale, {
        sameSite: 'strict',
        maxAge: 31536000 // 1 year
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
          request,
          resolvedLocale: locale
        })
      );
    }

    return response;
  };
}

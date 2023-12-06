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
  getBestMatchingDomain,
  getKnownLocaleFromPathname,
  getNormalizedPathname,
  getPathWithSearch,
  isLocaleSupportedOnDomain,
  applyBasePath
} from './utils';

const ROOT_URL = '/';

function receiveConfig<Locales extends AllLocales>(
  config: MiddlewareConfig<Locales>
): MiddlewareConfigWithDefaults<Locales> {
  const result: MiddlewareConfigWithDefaults<Locales> = {
    ...config,
    alternateLinks: config.alternateLinks ?? true,
    localePrefix: config.localePrefix ?? 'always',
    localeDetection: config.localeDetection ?? true
  };

  return result;
}

export default function createMiddleware<Locales extends AllLocales>(
  config: MiddlewareConfig<Locales>
) {
  const configWithDefaults = receiveConfig(config);

  return function middleware(request: NextRequest) {
    const {domain, locale} = resolveLocale(
      configWithDefaults,
      request.headers,
      request.cookies,
      request.nextUrl.pathname
    );

    const hasOutdatedCookie =
      configWithDefaults.localeDetection &&
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
      const urlObj = new URL(url, request.url);

      if (request.nextUrl.basePath) {
        urlObj.pathname = applyBasePath(
          urlObj.pathname,
          request.nextUrl.basePath
        );
      }

      return NextResponse.rewrite(urlObj, getResponseInit());
    }

    function redirect(url: string, redirectDomain?: string) {
      const urlObj = new URL(url, request.url);

      if (domainConfigs.length > 0) {
        if (!redirectDomain) {
          const bestMatchingDomain = getBestMatchingDomain(
            domain,
            locale,
            domainConfigs
          );

          if (bestMatchingDomain) {
            redirectDomain = bestMatchingDomain.domain;

            if (
              bestMatchingDomain.defaultLocale === locale &&
              configWithDefaults.localePrefix === 'as-needed' &&
              urlObj.pathname.startsWith(`/${locale}`)
            ) {
              urlObj.pathname = getNormalizedPathname(
                urlObj.pathname,
                configWithDefaults.locales
              );
            }
          }
        }
      }

      if (redirectDomain) {
        urlObj.protocol =
          request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol;
        urlObj.port = '';
        urlObj.host = redirectDomain;
      }

      if (request.nextUrl.basePath) {
        urlObj.pathname = applyBasePath(
          urlObj.pathname,
          request.nextUrl.basePath
        );
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
            getPathWithSearch(
              formatTemplatePathname(
                normalizedPathname,
                typeof pathnameConfig === 'string'
                  ? pathnameConfig
                  : pathnameConfig[resolvedTemplateLocale],
                localeTemplate,
                pathLocale || !isDefaultLocale ? locale : undefined
              ),
              request.nextUrl.search
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
        const internalPathWithSearch = getPathWithSearch(
          pathname,
          request.nextUrl.search
        );

        if (hasLocalePrefix) {
          const normalizedPathnameWithSearch = getPathWithSearch(
            normalizedPathname,
            request.nextUrl.search
          );

          if (configWithDefaults.localePrefix === 'never') {
            response = redirect(normalizedPathnameWithSearch);
          } else if (pathLocale === locale) {
            if (
              hasMatchedDefaultLocale &&
              configWithDefaults.localePrefix === 'as-needed'
            ) {
              response = redirect(normalizedPathnameWithSearch);
            } else {
              if (configWithDefaults.domains) {
                const pathDomain = getBestMatchingDomain(
                  domain,
                  pathLocale,
                  domainConfigs
                );

                if (domain?.domain !== pathDomain?.domain && !hasUnknownHost) {
                  response = redirect(
                    normalizedPathnameWithSearch,
                    pathDomain?.domain
                  );
                } else {
                  response = rewrite(internalPathWithSearch);
                }
              } else {
                response = rewrite(internalPathWithSearch);
              }
            }
          } else {
            response = redirect(`/${locale}${normalizedPathnameWithSearch}`);
          }
        } else {
          if (
            configWithDefaults.localePrefix === 'never' ||
            (hasMatchedDefaultLocale &&
              (configWithDefaults.localePrefix === 'as-needed' ||
                configWithDefaults.domains))
          ) {
            response = rewrite(`/${locale}${internalPathWithSearch}`);
          } else {
            response = redirect(`/${locale}${internalPathWithSearch}`);
          }
        }
      }
    }

    if (hasOutdatedCookie) {
      response.cookies.set(COOKIE_LOCALE_NAME, locale, {
        path: request.nextUrl.basePath || undefined,
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

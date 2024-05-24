import {NextRequest, NextResponse} from 'next/server';
import {
  COOKIE_LOCALE_NAME,
  COOKIE_MAX_AGE,
  COOKIE_SAME_SITE,
  HEADER_LOCALE_NAME
} from '../shared/constants';
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
  getPathnameMatch,
  getNormalizedPathname,
  getPathWithSearch,
  isLocaleSupportedOnDomain,
  applyBasePath,
  normalizeTrailingSlash
} from './utils';

const ROOT_URL = '/';

function receiveConfig<Locales extends AllLocales>(
  config: MiddlewareConfig<Locales>
): MiddlewareConfigWithDefaults<Locales> {
  const localePrefix =
    typeof config.localePrefix === 'object'
      ? config.localePrefix
      : {mode: config.localePrefix || 'always'};

  const result: MiddlewareConfigWithDefaults<Locales> = {
    ...config,
    alternateLinks: config.alternateLinks ?? true,
    localePrefix,
    localeDetection: config.localeDetection ?? true
  };

  return result;
}

export default function createMiddleware<Locales extends AllLocales>(
  config: MiddlewareConfig<Locales>
) {
  const configWithDefaults = receiveConfig(config);

  return function middleware(request: NextRequest) {
    // Resolve potential foreign symbols (e.g. /ja/%E7%B4%84 → /ja/約))
    const nextPathname = decodeURI(request.nextUrl.pathname);

    const {domain, locale} = resolveLocale(
      configWithDefaults,
      request.headers,
      request.cookies,
      nextPathname
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
      const urlObj = new URL(normalizeTrailingSlash(url), request.url);

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
              configWithDefaults.localePrefix.mode === 'as-needed' &&
              urlObj.pathname.startsWith(`/${locale}`)
            ) {
              urlObj.pathname = getNormalizedPathname(
                urlObj.pathname,
                configWithDefaults.locales,
                configWithDefaults.localePrefix
              );
            }
          }
        }
      }

      if (redirectDomain) {
        urlObj.host = redirectDomain;

        if (request.headers.get('x-forwarded-host')) {
          urlObj.protocol =
            request.headers.get('x-forwarded-proto') ??
            request.nextUrl.protocol;

          urlObj.port = request.headers.get('x-forwarded-port') ?? '';
        }
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
      nextPathname,
      configWithDefaults.locales,
      configWithDefaults.localePrefix
    );

    const pathnameMatch = getPathnameMatch(
      nextPathname,
      configWithDefaults.locales,
      configWithDefaults.localePrefix
    );
    const hasLocalePrefix = pathnameMatch != null;

    let response;
    let internalTemplateName: string | undefined;

    let pathname = nextPathname;
    if (configWithDefaults.pathnames) {
      let resolvedTemplateLocale: Locales[number] | undefined;
      [resolvedTemplateLocale, internalTemplateName] = getInternalTemplate(
        configWithDefaults.pathnames,
        normalizedPathname,
        locale
      );

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
            pathnameMatch?.locale
          );
        } else {
          let sourceTemplate;
          if (resolvedTemplateLocale) {
            // A localized pathname from another locale has matched
            sourceTemplate =
              typeof pathnameConfig === 'string'
                ? pathnameConfig
                : pathnameConfig[resolvedTemplateLocale];
          } else {
            // An internal pathname has matched that
            // doesn't have a localized pathname
            sourceTemplate = internalTemplateName;
          }

          const localePrefix =
            (hasLocalePrefix || !hasMatchedDefaultLocale) &&
            configWithDefaults.localePrefix.mode !== 'never'
              ? locale
              : undefined;

          response = redirect(
            getPathWithSearch(
              formatTemplatePathname(
                normalizedPathname,
                sourceTemplate,
                localeTemplate,
                localePrefix
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
          configWithDefaults.localePrefix.mode === 'never' ||
          (hasMatchedDefaultLocale &&
            configWithDefaults.localePrefix.mode === 'as-needed')
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

          if (configWithDefaults.localePrefix.mode === 'never') {
            response = redirect(normalizedPathnameWithSearch);
          } else if (pathnameMatch.exact) {
            if (
              hasMatchedDefaultLocale &&
              configWithDefaults.localePrefix.mode === 'as-needed'
            ) {
              response = redirect(normalizedPathnameWithSearch);
            } else {
              if (configWithDefaults.domains) {
                const pathDomain = getBestMatchingDomain(
                  domain,
                  pathnameMatch.locale,
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
            response = redirect(
              pathnameMatch.prefix + normalizedPathnameWithSearch
            );
          }
        } else {
          if (
            configWithDefaults.localePrefix.mode === 'never' ||
            (hasMatchedDefaultLocale &&
              (configWithDefaults.localePrefix.mode === 'as-needed' ||
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
        sameSite: COOKIE_SAME_SITE,
        maxAge: COOKIE_MAX_AGE
      });
    }

    if (
      configWithDefaults.localePrefix.mode !== 'never' &&
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

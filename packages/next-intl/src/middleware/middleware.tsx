import {NextRequest, NextResponse} from 'next/server';
import {AllLocales, Pathnames} from '../routing/types';
import {
  COOKIE_LOCALE_NAME,
  COOKIE_MAX_AGE,
  COOKIE_SAME_SITE,
  HEADER_LOCALE_NAME
} from '../shared/constants';
import {getLocalePrefix, matchesPathname} from '../shared/utils';
import {MiddlewareRoutingConfigInput, receiveConfig} from './config';
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

export default function createMiddleware<
  Locales extends AllLocales,
  AppPathnames extends Pathnames<Locales>
>(input: MiddlewareRoutingConfigInput<Locales, AppPathnames>) {
  const config = receiveConfig(input);

  return function middleware(request: NextRequest) {
    // Resolve potential foreign symbols (e.g. /ja/%E7%B4%84 → /ja/約))
    const nextPathname = decodeURI(request.nextUrl.pathname);

    const {domain, locale} = resolveLocale(
      config,
      request.headers,
      request.cookies,
      nextPathname
    );

    const hasOutdatedCookie =
      config.localeDetection &&
      request.cookies.get(COOKIE_LOCALE_NAME)?.value !== locale;

    const hasMatchedDefaultLocale = domain
      ? domain.defaultLocale === locale
      : locale === config.defaultLocale;

    const domainConfigs =
      config.domains?.filter((curDomain) =>
        isLocaleSupportedOnDomain(locale, curDomain)
      ) || [];
    const hasUnknownHost = config.domains != null && !domain;

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
              config.localePrefix.mode === 'as-needed' &&
              urlObj.pathname.startsWith(
                getLocalePrefix(locale, config.localePrefix)
              )
            ) {
              urlObj.pathname = getNormalizedPathname(
                urlObj.pathname,
                config.locales,
                config.localePrefix
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
      config.locales,
      config.localePrefix
    );

    const pathnameMatch = getPathnameMatch(
      nextPathname,
      config.locales,
      config.localePrefix
    );
    const hasLocalePrefix = pathnameMatch != null;

    let response;
    let internalTemplateName: keyof AppPathnames | undefined;

    let pathname = nextPathname;
    if (config.pathnames) {
      let resolvedTemplateLocale: Locales[number] | undefined;
      [resolvedTemplateLocale, internalTemplateName] = getInternalTemplate(
        config.pathnames,
        normalizedPathname,
        locale
      );

      if (internalTemplateName) {
        const pathnameConfig = config.pathnames[internalTemplateName];
        const localeTemplate: string =
          typeof pathnameConfig === 'string'
            ? pathnameConfig
            : // @ts-expect-error This is ok
              pathnameConfig[locale];

        if (matchesPathname(localeTemplate, normalizedPathname)) {
          pathname = formatTemplatePathname(
            normalizedPathname,
            localeTemplate,
            internalTemplateName as string,
            pathnameMatch?.locale
          );
        } else {
          let sourceTemplate;
          if (resolvedTemplateLocale) {
            // A localized pathname from another locale has matched
            sourceTemplate =
              typeof pathnameConfig === 'string'
                ? pathnameConfig
                : // @ts-expect-error This is ok
                  pathnameConfig[resolvedTemplateLocale];
          } else {
            // An internal pathname has matched that
            // doesn't have a localized pathname
            sourceTemplate = internalTemplateName;
          }

          const localePrefix =
            (hasLocalePrefix || !hasMatchedDefaultLocale) &&
            config.localePrefix.mode !== 'never'
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
      if (pathname === '/') {
        const pathWithSearch = getPathWithSearch(
          getLocalePrefix(locale, config.localePrefix),
          request.nextUrl.search
        );

        if (
          config.localePrefix.mode === 'never' ||
          (hasMatchedDefaultLocale && config.localePrefix.mode === 'as-needed')
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

          if (config.localePrefix.mode === 'never') {
            response = redirect(normalizedPathnameWithSearch);
          } else if (pathnameMatch.exact) {
            if (
              hasMatchedDefaultLocale &&
              config.localePrefix.mode === 'as-needed'
            ) {
              response = redirect(normalizedPathnameWithSearch);
            } else {
              if (config.domains) {
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
            config.localePrefix.mode === 'never' ||
            (hasMatchedDefaultLocale &&
              (config.localePrefix.mode === 'as-needed' || config.domains))
          ) {
            response = rewrite(`/${locale}${internalPathWithSearch}`);
          } else {
            response = redirect(
              getLocalePrefix(locale, config.localePrefix) +
                internalPathWithSearch
            );
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
      config.localePrefix.mode !== 'never' &&
      config.alternateLinks &&
      config.locales.length > 1
    ) {
      response.headers.set(
        'Link',
        getAlternateLinksHeaderValue({
          config,
          localizedPathnames:
            internalTemplateName != null
              ? config.pathnames?.[internalTemplateName]
              : undefined,
          request,
          resolvedLocale: locale
        })
      );
    }

    return response;
  };
}

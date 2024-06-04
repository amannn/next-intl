import {NextRequest, NextResponse} from 'next/server';
import {Locales, Pathnames} from '../routing/types';
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
  isLocaleSupportedOnDomain,
  applyBasePath,
  normalizeTrailingSlash,
  formatPathname,
  getLocaleAsPrefix
} from './utils';

export default function createMiddleware<
  AppLocales extends Locales,
  AppPathnames extends Pathnames<AppLocales>
>(input: MiddlewareRoutingConfigInput<AppLocales, AppPathnames>) {
  const config = receiveConfig(input);

  return function middleware(request: NextRequest) {
    // Resolve potential foreign symbols (e.g. /ja/%E7%B4%84 → /ja/約))
    const externalPathname = decodeURI(request.nextUrl.pathname);

    const {domain, locale} = resolveLocale(
      config,
      request.headers,
      request.cookies,
      externalPathname
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

    const unprefixedExternalPathname = getNormalizedPathname(
      externalPathname,
      config.locales,
      config.localePrefix
    );

    const pathnameMatch = getPathnameMatch(
      externalPathname,
      config.locales,
      config.localePrefix
    );
    const hasLocalePrefix = pathnameMatch != null;

    const isUnprefixedRouting =
      config.localePrefix.mode === 'never' ||
      (hasMatchedDefaultLocale && config.localePrefix.mode === 'as-needed');

    let response;
    let internalTemplateName: keyof AppPathnames | undefined;

    let unprefixedInternalPathname = unprefixedExternalPathname;
    if (config.pathnames) {
      let resolvedTemplateLocale: AppLocales[number] | undefined;
      [resolvedTemplateLocale, internalTemplateName] = getInternalTemplate(
        config.pathnames,
        unprefixedExternalPathname,
        locale
      );

      if (internalTemplateName) {
        const pathnameConfig = config.pathnames[internalTemplateName];
        const localeTemplate: string =
          typeof pathnameConfig === 'string'
            ? pathnameConfig
            : // @ts-expect-error This is ok
              pathnameConfig[locale];

        if (matchesPathname(localeTemplate, unprefixedExternalPathname)) {
          unprefixedInternalPathname = formatTemplatePathname(
            unprefixedExternalPathname,
            localeTemplate,
            internalTemplateName as string
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

          const localePrefix = isUnprefixedRouting
            ? undefined
            : getLocalePrefix(locale, config.localePrefix);

          const template = formatTemplatePathname(
            unprefixedExternalPathname,
            sourceTemplate,
            localeTemplate
          );

          response = redirect(
            formatPathname(template, localePrefix, request.nextUrl.search)
          );
        }
      }
    }

    if (!response) {
      if (unprefixedInternalPathname === '/' && !hasLocalePrefix) {
        if (isUnprefixedRouting) {
          response = rewrite(
            formatPathname(
              unprefixedInternalPathname,
              getLocaleAsPrefix(locale),
              request.nextUrl.search
            )
          );
        } else {
          response = redirect(
            formatPathname(
              unprefixedExternalPathname,
              getLocalePrefix(locale, config.localePrefix),
              request.nextUrl.search
            )
          );
        }
      } else {
        const internalHref = formatPathname(
          unprefixedInternalPathname,
          getLocaleAsPrefix(locale),
          request.nextUrl.search
        );

        if (hasLocalePrefix) {
          const externalHref = formatPathname(
            unprefixedExternalPathname,
            pathnameMatch.prefix,
            request.nextUrl.search
          );

          if (config.localePrefix.mode === 'never') {
            response = redirect(
              formatPathname(
                unprefixedExternalPathname,
                undefined,
                request.nextUrl.search
              )
            );
          } else if (pathnameMatch.exact) {
            if (hasMatchedDefaultLocale && isUnprefixedRouting) {
              response = redirect(
                formatPathname(
                  unprefixedExternalPathname,
                  undefined,
                  request.nextUrl.search
                )
              );
            } else {
              if (config.domains) {
                const pathDomain = getBestMatchingDomain(
                  domain,
                  pathnameMatch.locale,
                  domainConfigs
                );

                if (domain?.domain !== pathDomain?.domain && !hasUnknownHost) {
                  response = redirect(externalHref, pathDomain?.domain);
                } else {
                  response = rewrite(internalHref);
                }
              } else {
                response = rewrite(internalHref);
              }
            }
          } else {
            response = redirect(externalHref);
          }
        } else {
          if (isUnprefixedRouting) {
            response = rewrite(internalHref);
          } else {
            response = redirect(
              formatPathname(
                unprefixedExternalPathname,
                getLocalePrefix(locale, config.localePrefix),
                request.nextUrl.search
              )
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

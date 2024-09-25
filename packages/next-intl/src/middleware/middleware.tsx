import {NextRequest, NextResponse} from 'next/server';
import {receiveRoutingConfig, RoutingConfig} from '../routing/config';
import {Locales, Pathnames} from '../routing/types';
import {HEADER_LOCALE_NAME} from '../shared/constants';
import {
  getLocalePrefix,
  matchesPathname,
  normalizeTrailingSlash
} from '../shared/utils';
import {MiddlewareOptions} from './config';
import getAlternateLinksHeaderValue from './getAlternateLinksHeaderValue';
import resolveLocale from './resolveLocale';
import syncCookie from './syncCookie';
import {
  getInternalTemplate,
  formatTemplatePathname,
  getBestMatchingDomain,
  getPathnameMatch,
  getNormalizedPathname,
  isLocaleSupportedOnDomain,
  applyBasePath,
  formatPathname,
  getLocaleAsPrefix,
  sanitizePathname
} from './utils';

export default function createMiddleware<
  AppLocales extends Locales,
  AppPathnames extends Pathnames<AppLocales> = never
>(
  routing: RoutingConfig<AppLocales, AppPathnames> &
    // Convenience if `routing` is generated dynamically (i.e. without `defineRouting`)
    MiddlewareOptions,
  options?: MiddlewareOptions
) {
  const resolvedRouting = receiveRoutingConfig(routing);
  const resolvedOptions = {
    alternateLinks: options?.alternateLinks ?? routing.alternateLinks ?? true,
    localeDetection:
      options?.localeDetection ?? routing?.localeDetection ?? true
  };

  return function middleware(request: NextRequest) {
    let unsafeExternalPathname: string;
    try {
      // Resolve potential foreign symbols (e.g. /ja/%E7%B4%84 → /ja/約))
      unsafeExternalPathname = decodeURI(request.nextUrl.pathname);
    } catch (e) {
      // In case an invalid pathname is encountered, forward
      // it to Next.js which in turn responds with a 400
      return NextResponse.next();
    }

    // Sanitize malicious URIs to prevent open redirect attacks due to
    // decodeURI doesn't escape encoded backslashes ('%5C' & '%5c')
    const externalPathname = sanitizePathname(unsafeExternalPathname);

    const {domain, locale} = resolveLocale(
      resolvedRouting,
      resolvedOptions,
      request.headers,
      request.cookies,
      externalPathname
    );

    const hasMatchedDefaultLocale = domain
      ? domain.defaultLocale === locale
      : locale === resolvedRouting.defaultLocale;

    const domainsConfig =
      resolvedRouting.domains?.filter((curDomain) =>
        isLocaleSupportedOnDomain(locale, curDomain)
      ) || [];
    const hasUnknownHost = resolvedRouting.domains != null && !domain;

    function rewrite(url: string) {
      const urlObj = new URL(url, request.url);

      if (request.nextUrl.basePath) {
        urlObj.pathname = applyBasePath(
          urlObj.pathname,
          request.nextUrl.basePath
        );
      }

      const headers = new Headers(request.headers);
      headers.set(HEADER_LOCALE_NAME, locale);
      return NextResponse.rewrite(urlObj, {request: {headers}});
    }

    function redirect(url: string, redirectDomain?: string) {
      const urlObj = new URL(normalizeTrailingSlash(url), request.url);

      if (domainsConfig.length > 0 && !redirectDomain) {
        const bestMatchingDomain = getBestMatchingDomain(
          domain,
          locale,
          domainsConfig
        );
        if (bestMatchingDomain) {
          redirectDomain = bestMatchingDomain.domain;
          if (
            bestMatchingDomain.defaultLocale === locale &&
            resolvedRouting.localePrefix.mode === 'as-needed'
          ) {
            urlObj.pathname = getNormalizedPathname(
              urlObj.pathname,
              resolvedRouting.locales,
              resolvedRouting.localePrefix
            );
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
      resolvedRouting.locales,
      resolvedRouting.localePrefix
    );

    const pathnameMatch = getPathnameMatch(
      externalPathname,
      resolvedRouting.locales,
      resolvedRouting.localePrefix
    );
    const hasLocalePrefix = pathnameMatch != null;

    const isUnprefixedRouting =
      resolvedRouting.localePrefix.mode === 'never' ||
      (hasMatchedDefaultLocale &&
        resolvedRouting.localePrefix.mode === 'as-needed');

    let response;
    let internalTemplateName: keyof AppPathnames | undefined;

    let unprefixedInternalPathname = unprefixedExternalPathname;
    if ('pathnames' in resolvedRouting) {
      let resolvedTemplateLocale: AppLocales[number] | undefined;
      [resolvedTemplateLocale, internalTemplateName] = getInternalTemplate(
        resolvedRouting.pathnames,
        unprefixedExternalPathname,
        locale
      );

      if (internalTemplateName) {
        const pathnameConfig = resolvedRouting.pathnames[internalTemplateName];
        const localeTemplate: string =
          typeof pathnameConfig === 'string'
            ? pathnameConfig
            : // @ts-expect-error -- This is fine
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
                : // @ts-expect-error -- This is fine
                  pathnameConfig[resolvedTemplateLocale];
          } else {
            // An internal pathname has matched that
            // doesn't have a localized pathname
            sourceTemplate = internalTemplateName;
          }

          const localePrefix = isUnprefixedRouting
            ? undefined
            : getLocalePrefix(locale, resolvedRouting.localePrefix);

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
              getLocalePrefix(locale, resolvedRouting.localePrefix),
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

          if (resolvedRouting.localePrefix.mode === 'never') {
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
              if (resolvedRouting.domains) {
                const pathDomain = getBestMatchingDomain(
                  domain,
                  pathnameMatch.locale,
                  domainsConfig
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
                getLocalePrefix(locale, resolvedRouting.localePrefix),
                request.nextUrl.search
              )
            );
          }
        }
      }
    }

    if (resolvedOptions.localeDetection) {
      syncCookie(request, response, locale);
    }

    if (
      resolvedRouting.localePrefix.mode !== 'never' &&
      resolvedOptions.alternateLinks &&
      resolvedRouting.locales.length > 1
    ) {
      response.headers.set(
        'Link',
        getAlternateLinksHeaderValue({
          routing: resolvedRouting,
          localizedPathnames:
            internalTemplateName! != null && 'pathnames' in resolvedRouting
              ? resolvedRouting.pathnames?.[internalTemplateName]
              : undefined,
          request,
          resolvedLocale: locale
        })
      );
    }

    return response;
  };
}

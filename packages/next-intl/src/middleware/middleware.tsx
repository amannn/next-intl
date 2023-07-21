import {NextRequest, NextResponse} from 'next/server';
import {COOKIE_LOCALE_NAME} from '../shared/constants';
import MiddlewareConfig, {
  AllLocales,
  MiddlewareConfigWithDefaults
} from './NextIntlMiddlewareConfig';
import getAlternateLinksHeaderValue from './getAlternateLinksHeaderValue';
import {getLocalizedRewritePathname,getLocalizedRedirectPathname} from './LocalizedPathnames';
import resolveLocale from './resolveLocale';
import {
  getBasePath,
  getBestMatchingDomain,
  getKnownLocaleFromPathname,
  getPathWithSearch,
  isLocaleSupportedOnDomain
} from './utils';

const ROOT_URL = '/';

function receiveConfig<Locales extends AllLocales>(
  config: MiddlewareConfig<Locales>
): MiddlewareConfigWithDefaults<Locales> {
  return {
    ...config,
    alternateLinks: config.alternateLinks ?? true,
    localePrefix: config.localePrefix ?? 'as-needed',
    localeDetection: config.localeDetection ?? true
  };
}

// TODO: eslint-config-molindo needs an upgrade of @typescript-eslint/parser
export default function createMiddleware<const Locales extends AllLocales>(
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
      if (configWithDefaults.pathnames) {
        const localizedRedirect = getLocalizedRedirectPathname(
          request,
          locale,
          configWithDefaults
        )
        if (localizedRedirect) {
          response = redirect(localizedRedirect);
        } else {
          const localizedRewrite = getLocalizedRewritePathname(
            request,
            configWithDefaults
          );
          if (localizedRewrite) {
            response = rewrite(localizedRewrite);
          }
        }
      }

      if (!response) {
        const pathLocale = getKnownLocaleFromPathname(
          request.nextUrl.pathname,
          configWithDefaults.locales
        );
        const hasLocalePrefix = pathLocale != null;
        const pathWithSearch = getPathWithSearch(
          request.nextUrl.pathname,
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
        getAlternateLinksHeaderValue(configWithDefaults, request)
      );
    }

    return response;
  };
}

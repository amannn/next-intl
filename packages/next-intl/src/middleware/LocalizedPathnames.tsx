import {NextRequest} from 'next/server';
import {
  AllLocales,
  MiddlewareConfigWithDefaults
} from './NextIntlMiddlewareConfig';
import {
  formatPathname,
  getKnownLocaleFromPathname,
  getPathWithSearch,
  getRouteParams,
  matchesPathname
} from './utils';

export function getLocalizedRedirectPathname<Locales extends AllLocales>(
  request: NextRequest,
  resolvedLocale: Locales[number],
  configWithDefaults: MiddlewareConfigWithDefaults<Locales>
) {
  if (!configWithDefaults.pathnames) return;

  const {pathname} = request.nextUrl;
  const pathLocale = getKnownLocaleFromPathname(
    request.nextUrl.pathname,
    configWithDefaults.locales
  );

  if (pathLocale) {
    if (pathLocale === configWithDefaults.defaultLocale) {
      return;
    }

    for (const [, routePath] of Object.entries(configWithDefaults.pathnames)) {
      if (typeof routePath === 'string') {
        // No redirect is necessary if all locales use the same pathname
        continue;
      }

      const defaultLocaleTemplate = routePath[configWithDefaults.defaultLocale];
      const pathLocalePathname = `/${pathLocale}${defaultLocaleTemplate}`;
      const matches = matchesPathname(pathLocalePathname, pathname);

      if (matches) {
        const params = getRouteParams(pathLocalePathname, pathname);
        return getPathWithSearch(
          `/${pathLocale}` + formatPathname(routePath[pathLocale], params),
          request.nextUrl.search
        );
      }
    }
  } else if (resolvedLocale !== configWithDefaults.defaultLocale) {
    if (resolvedLocale === configWithDefaults.defaultLocale) {
      return;
    }

    // Check if the path matches a route from the default locale.
    // If this is the case, then redirect to a localized version.
    for (const [, routePath] of Object.entries(configWithDefaults.pathnames)) {
      if (typeof routePath === 'string') {
        // No redirect is necessary if all locales use the same pathname
        continue;
      }

      const defaultLocalePathname = routePath[configWithDefaults.defaultLocale];
      const matches = matchesPathname(defaultLocalePathname, pathname);

      if (matches) {
        const params = getRouteParams(defaultLocalePathname, pathname);
        return getPathWithSearch(
          `/${resolvedLocale}` +
            formatPathname(routePath[resolvedLocale], params),
          request.nextUrl.search
        );
      }
    }
  }

  return;
}

/**
 * Checks if the request matches a localized route
 * and returns the rewritten pathname if so.
 */
export function getLocalizedRewritePathname<Locales extends AllLocales>(
  request: NextRequest,
  configWithDefaults: MiddlewareConfigWithDefaults<Locales>
) {
  if (!configWithDefaults.pathnames) return;

  const {pathname} = request.nextUrl;
  const pathLocale = getKnownLocaleFromPathname(
    request.nextUrl.pathname,
    configWithDefaults.locales
  );

  if (
    // When using unprefixed routing, we assume that the
    // pathname uses routes from the default locale
    !pathLocale ||
    // Internal routes are set up based on the default locale
    pathLocale === configWithDefaults.defaultLocale
  ) {
    return;
  }

  for (const [, routePath] of Object.entries(configWithDefaults.pathnames)) {
    if (typeof routePath === 'string') {
      // No rewrite is necessary if all locales use the same pathname
      continue;
    }

    const defaultLocalePathname = routePath[configWithDefaults.defaultLocale];
    const pathLocalePathname = `/${pathLocale}${routePath[pathLocale]}`;
    const matches = matchesPathname(pathLocalePathname, pathname);

    if (matches) {
      const params = getRouteParams(pathLocalePathname, pathname);
      return getPathWithSearch(
        `/${pathLocale}` + formatPathname(defaultLocalePathname, params),
        request.nextUrl.search
      );
    }
  }

  return;
}

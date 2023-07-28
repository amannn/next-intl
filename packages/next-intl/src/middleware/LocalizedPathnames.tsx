import {NextRequest} from 'next/server';
import {AllLocales} from '../shared/types';
import {MiddlewareConfigWithDefaults} from './NextIntlMiddlewareConfig';
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

  // TODO
  // what if there's no path locale? assume default locale?
  // we can't use the defaultLocale btw., but should consult the domain config

  for (const [, localizedPathnames] of Object.entries(
    configWithDefaults.pathnames
  )) {
    if (typeof localizedPathnames === 'string') {
      // No redirect is necessary if all locales use the same pathname
      continue;
    }

    for (const [locale, localePathname] of Object.entries(localizedPathnames)) {
      if (resolvedLocale === locale) {
        continue;
      }

      let template = '';
      if (pathLocale) template = `/${pathLocale}`;
      template += localePathname;

      const matches = matchesPathname(template, pathname);
      if (matches) {
        const params = getRouteParams(template, pathname);

        let targetPathname = '';
        if (resolvedLocale !== configWithDefaults.defaultLocale || pathLocale) {
          targetPathname = `/${resolvedLocale}`;
        }
        targetPathname += formatPathname(
          localizedPathnames[resolvedLocale],
          params
        );

        return getPathWithSearch(targetPathname, request.nextUrl.search);
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

  // TODO
  // this assumption is wrong
  // maybe we should consult the domain config here to figure out the default locale and then use it to map a localized pathname to an internal one
  // generally test the case when the internal path is different than the default locale
  // const locale = pathLocale ?? configWithDefaults.defaultLocale;
  if (
    // When using unprefixed routing, we assume that the
    // pathname uses routes from the default locale
    !pathLocale
  ) {
    return;
  }

  for (const [internalPathname, localizedPathnames] of Object.entries(
    configWithDefaults.pathnames
  )) {
    if (typeof localizedPathnames === 'string') {
      // No rewrite is necessary if all locales use the same pathname
      continue;
    }

    if (internalPathname === localizedPathnames[pathLocale]) {
      // No rewrite is necessary if the localized pathname matches the internal one
      continue;
    }

    const pathLocalePathname = `/${pathLocale}${localizedPathnames[pathLocale]}`;
    const matches = matchesPathname(pathLocalePathname, pathname);

    if (matches) {
      const params = getRouteParams(pathLocalePathname, pathname);
      return getPathWithSearch(
        `/${pathLocale}` + formatPathname(internalPathname, params),
        request.nextUrl.search
      );
    }
  }

  return;
}

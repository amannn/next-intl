import {pathToRegexp, match, compile} from 'path-to-regexp';
import {AllLocales} from '../shared/types';
import {DomainConfig} from './NextIntlMiddlewareConfig';

export function getLocaleFromPathname(pathname: string) {
  return pathname.split('/')[1];
}

export function getKnownLocaleFromPathname<Locales extends AllLocales>(
  pathname: string,
  locales: Locales
): Locales[number] | undefined {
  const pathLocaleCandidate = getLocaleFromPathname(pathname);
  const pathLocale = locales.includes(pathLocaleCandidate)
    ? pathLocaleCandidate
    : undefined;
  return pathLocale;
}

export function getBasePath(pathname: string, pathLocale: string) {
  return pathname.replace(`/${pathLocale}`, '') || '/';
}

export function matchesPathname(template: string, pathname: string) {
  const regex = pathToRegexp(template);
  const matches = regex.exec(pathname);
  return matches != null;
}

export function getRouteParams(template: string, pathname: string) {
  const fn = match(
    template
    // { decode: decodeURIComponent }
  );

  const result = fn(pathname);
  return result ? result.params : undefined;
}

export function formatPathname(template: string, params?: object) {
  const toPath = compile(template);
  return toPath(params);
}

export function getPathWithSearch(
  pathname: string,
  search: string | undefined
) {
  let pathWithSearch = pathname;
  if (search) {
    pathWithSearch += search;
  }
  return pathWithSearch;
}

export function getHost(requestHeaders: Headers) {
  return (
    requestHeaders.get('x-forwarded-host') ??
    requestHeaders.get('host') ??
    undefined
  );
}

export function isLocaleSupportedOnDomain<Locales extends AllLocales>(
  locale: string,
  domain: DomainConfig<Locales>
) {
  return (
    domain.defaultLocale === locale ||
    !domain.locales ||
    domain.locales.includes(locale)
  );
}

export function getBestMatchingDomain<Locales extends AllLocales>(
  curHostDomain: DomainConfig<Locales> | undefined,
  locale: string,
  domainConfigs: Array<DomainConfig<Locales>>
) {
  let domainConfig;

  // Prio 1: Stay on current domain
  if (curHostDomain && isLocaleSupportedOnDomain(locale, curHostDomain)) {
    domainConfig = curHostDomain;
  }

  // Prio 2: Use alternative domain with matching default locale
  if (!domainConfig) {
    domainConfig = domainConfigs.find((cur) => cur.defaultLocale === locale);
  }

  // Prio 3: Use alternative domain with restricted matching locale
  if (!domainConfig) {
    domainConfig = domainConfigs.find(
      (cur) => cur.locales != null && cur.locales.includes(locale)
    );
  }

  // Prio 4: Stay on the current domain if it supports all locales
  if (!domainConfig && curHostDomain?.locales == null) {
    domainConfig = curHostDomain;
  }

  // Prio 5: Use alternative domain that supports all locales
  if (!domainConfig) {
    domainConfig = domainConfigs.find((cur) => !cur.locales);
  }

  return domainConfig;
}

import {AllLocales} from '../shared/types';
import {
  DomainConfig,
  MiddlewareConfigWithDefaults
} from './NextIntlMiddlewareConfig';

export function getLocaleFromPathname(pathname: string) {
  return pathname.split('/')[1];
}

export function getInternalTemplate<Locales extends AllLocales>(
  pathnames: NonNullable<MiddlewareConfigWithDefaults<Locales>['pathnames']>,
  pathname: string
): [Locales[number] | undefined, string | undefined] {
  for (const [internalPathname, localizedPathnamesOrPathname] of Object.entries(
    pathnames
  )) {
    if (typeof localizedPathnamesOrPathname === 'string') {
      const localizedPathname = localizedPathnamesOrPathname;
      if (matchesPathname(localizedPathname, pathname)) {
        return [undefined, internalPathname];
      }
    } else {
      for (const [locale, localizedPathname] of Object.entries(
        localizedPathnamesOrPathname
      )) {
        if (matchesPathname(localizedPathname as string, pathname)) {
          return [locale, internalPathname];
        }
      }
    }
  }

  return [undefined, undefined];
}

export function formatInternalPathname(
  pathname: string,
  localeTemplate: string,
  internalTemplate: string,
  localePrefix?: string
) {
  const params = getRouteParams(localeTemplate, pathname);
  let targetPathname = '';
  if (localePrefix) {
    targetPathname = `/${localePrefix}`;
  }
  targetPathname += formatPathname(internalTemplate, params);
  return targetPathname;
}

/**
 * Removes potential locales from the pathname.
 */
export function getNormalizedPathname<Locales extends AllLocales>(
  pathname: string,
  locales: Locales
) {
  const match = pathname.match(`^/(${locales.join('|')})(.*)`);
  return match?.[2] || pathname;
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

function templateToRegex(template: string): RegExp {
  const regexPattern = template
    .replace(/\[([^\]]+)\]/g, (match) => {
      if (match.startsWith('[...')) return '(.*)';
      if (match.startsWith('[[...')) return '(.*)';
      return '([^/]+)';
    })
    // Clean up regex match remainders from optional catchall ('[[...slug]]')
    .replaceAll('(.*)]', '(.*)');

  return new RegExp(`^${regexPattern}$`);
}

export function matchesPathname(
  /** E.g. `/users/[userId]-[userName]` */
  template: string,
  /** E.g. `/users/23-jane` */
  pathname: string
) {
  const regex = templateToRegex(template);
  return regex.test(pathname);
}

export function getRouteParams(template: string, pathname: string) {
  const regex = templateToRegex(template);
  const match = regex.exec(pathname);
  if (!match) return undefined;
  const params: Record<string, string> = {};
  for (let i = 1; i < match.length; i++) {
    const key = template.match(/\[([^\]]+)\]/g)?.[i - 1].replace(/[[\]]/g, '');
    if (key) params[key] = match[i];
  }
  return params;
}

export function formatPathname(template: string, params?: object) {
  if (!params) return template;

  // Simplify syntax for optional catchall ('[[...slug]]') so
  // we can replace the value with simple interpolation
  template = template.replaceAll('[[', '[').replaceAll(']]', ']');

  let result = template;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`[${key}]`, value);
  });

  return result;
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

import {AllLocales} from '../shared/types';
import {matchesPathname, templateToRegex} from '../shared/utils';
import {
  DomainConfig,
  MiddlewareConfigWithDefaults
} from './NextIntlMiddlewareConfig';

export function getFirstPathnameSegment(pathname: string) {
  return pathname.split('/')[1];
}

function getExternalPath<Locales extends AllLocales>(
  path: string | {[Key in Locales[number]]: string}
): string {
  const firstLocalePath = Object.values(path)[0];
  return typeof path === 'string' ? path : firstLocalePath;
}

function isCatchAllRoute(pathname: string) {
  return isOptionalCatchAll(pathname) || isCatchAll(pathname);
}

function isOptionalCatchAll(pathname: string) {
  return pathname.includes('[[...');
}

function isCatchAll(pathname: string) {
  return pathname.includes('[...');
}

function isDynamicRoute(pathname: string) {
  return pathname.includes('[');
}

type PathnamePair<Locales extends AllLocales> = [
  string,
  string | {[Key in Locales[number]]: string}
];

export function comparePathnamePairs<Locales extends AllLocales>(
  a: PathnamePair<Locales>,
  b: PathnamePair<Locales>
): number {
  const pathA = getExternalPath(a[1]);
  const pathB = getExternalPath(b[1]);

  const dynamicA = isDynamicRoute(pathA);
  const dynamicB = isDynamicRoute(pathB);
  const catchAllA = isCatchAllRoute(pathA);
  const catchAllB = isCatchAllRoute(pathB);

  // Prioritize static routes over dynamic and catch-all routes
  if (!dynamicA && dynamicB) return -1;
  if (dynamicA && !dynamicB) return 1;

  // Both paths are either dynamic or static, prioritize non-catch-all over catch-all
  if (catchAllA && !catchAllB) return 1;
  if (!catchAllA && catchAllB) return -1;

  // If both are the same type (static, dynamic non-catch-all, or catch-all), prioritize by depth
  const depthA = pathA.split('/').length;
  const depthB = pathB.split('/').length;

  // Deeper (more specific) paths first
  if (depthA !== depthB) return depthB - depthA;

  return 0;
}

export function getSortedPathnames<Locales extends AllLocales>(
  pathnames: NonNullable<MiddlewareConfigWithDefaults<Locales>['pathnames']>
) {
  const sortedPathnames = Object.entries(pathnames).sort(comparePathnamePairs);
  return sortedPathnames;
}

export function getInternalTemplate<
  Locales extends AllLocales,
  Pathnames extends NonNullable<
    MiddlewareConfigWithDefaults<Locales>['pathnames']
  >
>(
  pathnames: Pathnames,
  pathname: string,
  locale: Locales[number]
): [Locales[number] | undefined, keyof Pathnames | undefined] {
  // Sort pathnames by specificity
  const sortedPathnames = getSortedPathnames(pathnames);
  // Try to find a localized pathname that matches
  for (const [
    internalPathname,
    localizedPathnamesOrPathname
  ] of sortedPathnames) {
    if (typeof localizedPathnamesOrPathname === 'string') {
      const localizedPathname = localizedPathnamesOrPathname;
      if (matchesPathname(localizedPathname, pathname)) {
        return [undefined, internalPathname];
      }
    } else {
      // Prefer the entry with the current locale in case multiple
      // localized pathnames match the current pathname
      const sortedEntries = Object.entries(localizedPathnamesOrPathname);
      const curLocaleIndex = sortedEntries.findIndex(
        ([entryLocale]) => entryLocale === locale
      );
      if (curLocaleIndex > 0) {
        sortedEntries.unshift(sortedEntries.splice(curLocaleIndex, 1)[0]);
      }

      for (const [entryLocale, entryPathname] of sortedEntries) {
        if (matchesPathname(entryPathname as string, pathname)) {
          return [entryLocale, internalPathname];
        }
      }
    }
  }

  // Try to find an internal pathname that matches (this can be the case
  // if all localized pathnames are different from the internal pathnames).
  for (const internalPathname of Object.keys(pathnames)) {
    if (matchesPathname(internalPathname, pathname)) {
      return [undefined, internalPathname];
    }
  }

  // No match
  return [undefined, undefined];
}

export function formatTemplatePathname(
  sourcePathname: string,
  sourceTemplate: string,
  targetTemplate: string,
  localePrefix?: string
) {
  const params = getRouteParams(sourceTemplate, sourcePathname);
  let targetPathname = '';
  if (localePrefix) {
    targetPathname = `/${localePrefix}`;
  }

  targetPathname += formatPathname(targetTemplate, params);
  targetPathname = normalizeTrailingSlash(targetPathname);

  return targetPathname;
}

/**
 * Removes potential locales from the pathname.
 */
export function getNormalizedPathname<Locales extends AllLocales>(
  pathname: string,
  locales: Locales
) {
  // Add trailing slash for consistent handling
  // both for the root as well as nested paths
  if (!pathname.endsWith('/')) {
    pathname += '/';
  }

  const match = pathname.match(
    new RegExp(`^/(${locales.join('|')})/(.*)`, 'i')
  );
  let result = match ? '/' + match[2] : pathname;

  if (result !== '/') {
    result = normalizeTrailingSlash(result);
  }

  return result;
}

export function findCaseInsensitiveLocale<Locales extends AllLocales>(
  candidate: string,
  locales: Locales
) {
  return locales.find(
    (locale) => locale.toLowerCase() === candidate.toLowerCase()
  );
}

export function getPathnameLocale<Locales extends AllLocales>(
  pathname: string,
  locales: Locales
): Locales[number] | undefined {
  const pathLocaleCandidate = getFirstPathnameSegment(pathname);
  const pathLocale = findCaseInsensitiveLocale(pathLocaleCandidate, locales)
    ? pathLocaleCandidate
    : undefined;
  return pathLocale;
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
  template = template.replace(/\[\[/g, '[').replace(/\]\]/g, ']');

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

export function applyBasePath(pathname: string, basePath: string) {
  return normalizeTrailingSlash(basePath + pathname);
}

function normalizeTrailingSlash(pathname: string) {
  if (pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  return pathname;
}

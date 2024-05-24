import {AllLocales, LocalePrefixConfig, LocalePrefixes} from '../shared/types';
import {matchesPathname, templateToRegex} from '../shared/utils';
import {
  DomainConfig,
  MiddlewareConfigWithDefaults
} from './NextIntlMiddlewareConfig';

export function getFirstPathnameSegment(pathname: string) {
  return pathname.split('/')[1];
}

function isOptionalCatchAllSegment(pathname: string) {
  return pathname.includes('[[...');
}

function isCatchAllSegment(pathname: string) {
  return pathname.includes('[...');
}

function isDynamicSegment(pathname: string) {
  return pathname.includes('[');
}

export function comparePathnamePairs(a: string, b: string): number {
  const pathA = a.split('/');
  const pathB = b.split('/');

  const maxLength = Math.max(pathA.length, pathB.length);
  for (let i = 0; i < maxLength; i++) {
    const segmentA = pathA[i];
    const segmentB = pathB[i];

    // If one of the paths ends, prioritize the shorter path
    if (!segmentA && segmentB) return -1;
    if (segmentA && !segmentB) return 1;

    // Prioritize static segments over dynamic segments
    if (!isDynamicSegment(segmentA) && isDynamicSegment(segmentB)) return -1;
    if (isDynamicSegment(segmentA) && !isDynamicSegment(segmentB)) return 1;

    // Prioritize non-catch-all segments over catch-all segments
    if (!isCatchAllSegment(segmentA) && isCatchAllSegment(segmentB)) return -1;
    if (isCatchAllSegment(segmentA) && !isCatchAllSegment(segmentB)) return 1;

    // Prioritize non-optional catch-all segments over optional catch-all segments
    if (
      !isOptionalCatchAllSegment(segmentA) &&
      isOptionalCatchAllSegment(segmentB)
    ) {
      return -1;
    }
    if (
      isOptionalCatchAllSegment(segmentA) &&
      !isOptionalCatchAllSegment(segmentB)
    ) {
      return 1;
    }

    if (segmentA === segmentB) continue;
  }

  // Both pathnames are completely static
  return 0;
}

export function getSortedPathnames(pathnames: Array<string>) {
  const sortedPathnames = pathnames.sort(comparePathnamePairs);
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
  const sortedPathnames = getSortedPathnames(Object.keys(pathnames));

  // Try to find a localized pathname that matches
  for (const internalPathname of sortedPathnames) {
    const localizedPathnamesOrPathname = pathnames[internalPathname];
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
  prefix?: string
) {
  const params = getRouteParams(sourceTemplate, sourcePathname);
  let targetPathname = '';
  if (prefix) {
    targetPathname = `/${prefix}`;
  }

  targetPathname += formatPathname(targetTemplate, params);
  targetPathname = normalizeTrailingSlash(targetPathname);

  return targetPathname;
}

/**
 * Removes potential prefixes from the pathname.
 */
export function getNormalizedPathname<Locales extends AllLocales>(
  pathname: string,
  locales: Locales,
  localePrefix: LocalePrefixConfig<Locales>
) {
  // Add trailing slash for consistent handling
  // both for the root as well as nested paths
  if (!pathname.endsWith('/')) {
    pathname += '/';
  }

  const localePrefixes = getLocalePrefixes(locales, localePrefix);
  const regex = new RegExp(
    `^(${localePrefixes
      .map(([, prefix]) => prefix.replaceAll('/', '\\/'))
      .join('|')})/(.*)`,
    'i'
  );
  const match = pathname.match(regex);

  let result = match ? '/' + match[2] : pathname;
  if (result !== '/') {
    result = normalizeTrailingSlash(result);
  }

  return result;
}

export function findCaseInsensitiveString(
  candidate: string,
  strings: Array<string>
) {
  return strings.find((cur) => cur.toLowerCase() === candidate.toLowerCase());
}

export function getLocalePrefixes<Locales extends AllLocales>(
  locales: Locales,
  localePrefix: LocalePrefixConfig<Locales>
): Array<[Locales[number], string]> {
  const prefixesConfig =
    (typeof localePrefix === 'object' &&
      localePrefix.mode !== 'never' &&
      localePrefix.prefixes) ||
    ({} as LocalePrefixes<Locales>);

  return locales.map((locale) => [
    locale as Locales[number],
    prefixesConfig[locale as Locales[number]] ?? '/' + locale
  ]);
}

export function getPathnameMatch<Locales extends AllLocales>(
  pathname: string,
  locales: Locales,
  localePrefix: LocalePrefixConfig<Locales>
):
  | {
      locale: Locales[number];
      prefix: string;
      matchedPrefix: string;
      exact?: boolean;
    }
  | undefined {
  const localePrefixes = getLocalePrefixes(locales, localePrefix);

  for (const [locale, prefix] of localePrefixes) {
    let exact, matches;
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      exact = matches = true;
    } else {
      const normalizedPathname = pathname.toLowerCase();
      const normalizedPrefix = prefix.toLowerCase();
      if (
        normalizedPathname === normalizedPrefix ||
        normalizedPathname.startsWith(normalizedPrefix + '/')
      ) {
        exact = false;
        matches = true;
      }
    }

    if (matches) {
      return {
        locale,
        prefix,
        matchedPrefix: pathname.slice(0, prefix.length),
        exact
      };
    }
  }
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

export function normalizeTrailingSlash(pathname: string) {
  if (pathname !== '/' && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  return pathname;
}

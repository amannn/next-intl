import {
  Locales,
  LocalePrefixConfigVerbose,
  DomainConfig,
  Pathnames,
  DomainsConfig
} from '../routing/types';
import {
  getLocalePrefix,
  getSortedPathnames,
  matchesPathname,
  prefixPathname,
  templateToRegex
} from '../shared/utils';

export function getFirstPathnameSegment(pathname: string) {
  return pathname.split('/')[1];
}

export function getInternalTemplate<
  AppLocales extends Locales,
  AppPathnames extends Pathnames<AppLocales>
>(
  pathnames: AppPathnames,
  pathname: string,
  locale: AppLocales[number]
): [AppLocales[number] | undefined, keyof AppPathnames | undefined] {
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
  // if all localized pathnames are different from the internal pathnames)
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

  targetPathname += formatPathnameTemplate(targetTemplate, params);
  targetPathname = normalizeTrailingSlash(targetPathname);

  return targetPathname;
}

/**
 * Removes potential prefixes from the pathname.
 */
export function getNormalizedPathname<AppLocales extends Locales>(
  pathname: string,
  locales: AppLocales,
  localePrefix: LocalePrefixConfigVerbose<AppLocales>
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

export function getLocalePrefixes<AppLocales extends Locales>(
  locales: AppLocales,
  localePrefix: LocalePrefixConfigVerbose<AppLocales>
): Array<[AppLocales[number], string]> {
  return locales.map((locale) => [
    locale as AppLocales[number],
    getLocalePrefix(locale, localePrefix)
  ]);
}

export function getPathnameMatch<AppLocales extends Locales>(
  pathname: string,
  locales: AppLocales,
  localePrefix: LocalePrefixConfigVerbose<AppLocales>
):
  | {
      locale: AppLocales[number];
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

export function formatPathnameTemplate(template: string, params?: object) {
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

export function formatPathname(
  pathname: string,
  prefix: string | undefined,
  search: string | undefined
) {
  let result = pathname;

  if (prefix) {
    result = prefixPathname(prefix, result);
  }

  if (search) {
    result += search;
  }
  return result;
}

export function getHost(requestHeaders: Headers) {
  return (
    requestHeaders.get('x-forwarded-host') ??
    requestHeaders.get('host') ??
    undefined
  );
}

export function isLocaleSupportedOnDomain<AppLocales extends Locales>(
  locale: string,
  domain: DomainConfig<AppLocales>
) {
  return (
    domain.defaultLocale === locale ||
    !domain.locales ||
    domain.locales.includes(locale)
  );
}

export function getBestMatchingDomain<AppLocales extends Locales>(
  curHostDomain: DomainConfig<AppLocales> | undefined,
  locale: string,
  domainsConfig: DomainsConfig<AppLocales>
) {
  let domainConfig;

  // Prio 1: Stay on current domain
  if (curHostDomain && isLocaleSupportedOnDomain(locale, curHostDomain)) {
    domainConfig = curHostDomain;
  }

  // Prio 2: Use alternative domain with matching default locale
  if (!domainConfig) {
    domainConfig = domainsConfig.find((cur) => cur.defaultLocale === locale);
  }

  // Prio 3: Use alternative domain with restricted matching locale
  if (!domainConfig) {
    domainConfig = domainsConfig.find(
      (cur) => cur.locales != null && cur.locales.includes(locale)
    );
  }

  // Prio 4: Stay on the current domain if it supports all locales
  if (!domainConfig && curHostDomain?.locales == null) {
    domainConfig = curHostDomain;
  }

  // Prio 5: Use alternative domain that supports all locales
  if (!domainConfig) {
    domainConfig = domainsConfig.find((cur) => !cur.locales);
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

export function getLocaleAsPrefix<AppLocales extends Locales>(
  locale: AppLocales[number]
) {
  return `/${locale}`;
}

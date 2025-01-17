import type {ParsedUrlQueryInput} from 'node:querystring';
import type {UrlObject} from 'url';
import type {Locale} from 'use-intl';
import type {ResolvedRoutingConfig} from '../../routing/config.js';
import type {
  DomainsConfig,
  LocalePrefixMode,
  Locales,
  Pathnames
} from '../../routing/types.js';
import {
  getLocalePrefix,
  getSortedPathnames,
  isLocalizableHref,
  matchesPathname,
  normalizeTrailingSlash,
  prefixPathname
} from '../../shared/utils.js';
import type StrictParams from './StrictParams.js';

type SearchParamValue = ParsedUrlQueryInput[keyof ParsedUrlQueryInput];

// Minor false positive: A route that has both optional and
// required params will allow optional params.
type HrefOrHrefWithParamsImpl<Pathname, Other> =
  Pathname extends `${string}[[...${string}`
    ? // Optional catch-all
      Pathname | ({pathname: Pathname; params?: StrictParams<Pathname>} & Other)
    : Pathname extends `${string}[${string}`
      ? // Required catch-all & regular params
        {pathname: Pathname; params: StrictParams<Pathname>} & Other
      : // No params
        Pathname | ({pathname: Pathname} & Other);

// For `Link`
export type HrefOrUrlObjectWithParams<Pathname> = HrefOrHrefWithParamsImpl<
  Pathname,
  Omit<UrlObject, 'pathname'>
>;

export type QueryParams = Record<string, SearchParamValue>;

// For `getPathname` (hence also its consumers: `redirect`, `useRouter`, …)
export type HrefOrHrefWithParams<Pathname> = HrefOrHrefWithParamsImpl<
  Pathname,
  {query?: QueryParams}
>;

export function normalizeNameOrNameWithParams<Pathname>(
  href:
    | HrefOrHrefWithParams<Pathname>
    | {
        locale: Locale;
        href: HrefOrHrefWithParams<Pathname>;
      }
): {
  pathname: Pathname;
  params?: StrictParams<Pathname>;
} {
  return typeof href === 'string'
    ? {pathname: href as Pathname}
    : (href as {
        pathname: Pathname;
        params?: StrictParams<Pathname>;
      });
}

export function serializeSearchParams(
  searchParams: Record<string, SearchParamValue>
) {
  function serializeValue(value: SearchParamValue) {
    return String(value);
  }

  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((cur) => {
        urlSearchParams.append(key, serializeValue(cur));
      });
    } else {
      urlSearchParams.set(key, serializeValue(value));
    }
  }
  return '?' + urlSearchParams.toString();
}

type StrictUrlObject<Pathname> = Omit<UrlObject, 'pathname'> & {
  pathname: Pathname;
};

export function compileLocalizedPathname<
  AppLocales extends Locales,
  Pathname
>(opts: {
  locale: AppLocales[number];
  pathname: Pathname;
  params?: StrictParams<Pathname>;
  pathnames: Pathnames<AppLocales>;
  query?: Record<string, SearchParamValue>;
}): string;
export function compileLocalizedPathname<
  AppLocales extends Locales,
  Pathname
>(opts: {
  locale: AppLocales[number];
  pathname: StrictUrlObject<Pathname>;
  params?: StrictParams<Pathname>;
  pathnames: Pathnames<AppLocales>;
  query?: Record<string, SearchParamValue>;
}): UrlObject;
export function compileLocalizedPathname<AppLocales extends Locales, Pathname>({
  pathname,
  locale,
  params,
  pathnames,
  query
}: {
  locale: AppLocales[number];
  pathname: keyof typeof pathnames | StrictUrlObject<keyof typeof pathnames>;
  params?: StrictParams<Pathname>;
  pathnames: Pathnames<AppLocales>;
  query?: Record<string, SearchParamValue>;
}) {
  function getNamedPath(value: keyof typeof pathnames) {
    let namedPath = pathnames[value];
    if (!namedPath) {
      // Unknown pathnames
      namedPath = value;
    }
    return namedPath;
  }

  function compilePath(
    namedPath: Pathnames<AppLocales>[keyof Pathnames<AppLocales>]
  ) {
    const template =
      typeof namedPath === 'string' ? namedPath : namedPath[locale];
    let compiled = template;

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        let regexp: string, replacer: string;

        if (Array.isArray(value)) {
          regexp = `(\\[)?\\[...${key}\\](\\])?`;
          replacer = value.map((v) => String(v)).join('/');
        } else {
          regexp = `\\[${key}\\]`;
          replacer = String(value);
        }

        compiled = compiled.replace(new RegExp(regexp, 'g'), replacer);
      });
    }

    // Clean up optional catch-all segments that were not replaced
    compiled = compiled.replace(/\[\[\.\.\..+\]\]/g, '');
    compiled = normalizeTrailingSlash(compiled);

    if (process.env.NODE_ENV !== 'production' && compiled.includes('[')) {
      // Next.js throws anyway, therefore better provide a more helpful error message
      throw new Error(
        `Insufficient params provided for localized pathname.\nTemplate: ${template}\nParams: ${JSON.stringify(
          params
        )}`
      );
    }

    if (query) {
      compiled += serializeSearchParams(query);
    }

    return compiled;
  }

  if (typeof pathname === 'string') {
    const namedPath = getNamedPath(pathname);
    const compiled = compilePath(namedPath);
    return compiled;
  } else {
    const {pathname: href, ...rest} = pathname;
    const namedPath = getNamedPath(href);
    const compiled = compilePath(namedPath);
    const result: UrlObject = {...rest, pathname: compiled};
    return result;
  }
}

export function getRoute<AppLocales extends Locales>(
  locale: AppLocales[number],
  pathname: string,
  pathnames: Pathnames<AppLocales>
): keyof Pathnames<AppLocales> {
  const sortedPathnames = getSortedPathnames(Object.keys(pathnames));
  const decoded = decodeURI(pathname);

  for (const internalPathname of sortedPathnames) {
    const localizedPathnamesOrPathname = pathnames[internalPathname];
    if (typeof localizedPathnamesOrPathname === 'string') {
      const localizedPathname = localizedPathnamesOrPathname;
      if (matchesPathname(localizedPathname, decoded)) {
        return internalPathname;
      }
    } else {
      if (matchesPathname(localizedPathnamesOrPathname[locale], decoded)) {
        return internalPathname;
      }
    }
  }

  return pathname as keyof Pathnames<AppLocales>;
}

export function getBasePath(
  pathname: string,
  windowPathname = window.location.pathname
) {
  if (pathname === '/') {
    return windowPathname;
  } else {
    return windowPathname.replace(pathname, '');
  }
}

export function applyPathnamePrefix<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode,
  AppPathnames extends Pathnames<AppLocales> | undefined,
  AppDomains extends DomainsConfig<AppLocales> | undefined
>(
  pathname: string,
  locale: Locales[number],
  routing: Pick<
    ResolvedRoutingConfig<
      AppLocales,
      AppLocalePrefixMode,
      AppPathnames,
      AppDomains
    >,
    'localePrefix' | 'domains'
  > &
    Partial<
      Pick<
        ResolvedRoutingConfig<
          AppLocales,
          AppLocalePrefixMode,
          AppPathnames,
          AppDomains
        >,
        'defaultLocale'
      >
    >,
  domain?: string,
  force?: boolean
): string {
  const {mode} = routing.localePrefix;

  let shouldPrefix;
  if (force !== undefined) {
    shouldPrefix = force;
  } else if (isLocalizableHref(pathname)) {
    if (mode === 'always') {
      shouldPrefix = true;
    } else if (mode === 'as-needed') {
      let defaultLocale: AppLocales[number] | undefined = routing.defaultLocale;

      if (routing.domains) {
        const domainConfig = routing.domains.find(
          (cur) => cur.domain === domain
        );
        if (domainConfig) {
          defaultLocale = domainConfig.defaultLocale;
        } else if (process.env.NODE_ENV !== 'production') {
          if (!domain) {
            console.error(
              "You're using a routing configuration with `localePrefix: 'as-needed'` in combination with `domains`. In order to compute a correct pathname, you need to provide a `domain` parameter.\n\nSee: https://next-intl.dev/docs/routing#domains-localeprefix-asneeded"
            );
          } else {
            // If a domain was provided, but it wasn't found in the routing
            // configuration, this can be an indicator that the user is on
            // localhost. In this case, we can simply use the domain-agnostic
            // default locale.
          }
        }
      }

      shouldPrefix = defaultLocale !== locale;
    }
  }

  return shouldPrefix
    ? prefixPathname(getLocalePrefix(locale, routing.localePrefix), pathname)
    : pathname;
}

export function validateReceivedConfig<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode,
  AppPathnames extends Pathnames<AppLocales> | undefined,
  AppDomains extends DomainsConfig<AppLocales> | undefined
>(
  config: Partial<
    Pick<
      ResolvedRoutingConfig<
        AppLocales,
        AppLocalePrefixMode,
        AppPathnames,
        AppDomains
      >,
      'defaultLocale' | 'localePrefix'
    >
  >
) {
  if (
    config.localePrefix?.mode === 'as-needed' &&
    !('defaultLocale' in config)
  ) {
    throw new Error("`localePrefix: 'as-needed' requires a `defaultLocale`.");
  }
}

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
  getLocalizedTemplate,
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
    namedPath: Pathnames<AppLocales>[keyof Pathnames<AppLocales>],
    internalPathname: string
  ) {
    const template = getLocalizedTemplate(namedPath, locale, internalPathname);
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
    if (process.env.NODE_ENV !== 'production' && compiled.includes('[')) {
      // Next.js throws anyway, therefore better provide a more helpful error message
      throw new Error(
        `Insufficient params provided for localized pathname.\nTemplate: ${template}\nParams: ${JSON.stringify(
          params
        )}`
      );
    }

    compiled = normalizeTrailingSlash(compiled);
    compiled = encodePathname(compiled);

    if (query) {
      // This also encodes non-ASCII characters by
      // using `new URLSearchParams()` internally
      compiled += serializeSearchParams(query);
    }

    return compiled;
  }

  if (typeof pathname === 'string') {
    const namedPath = getNamedPath(pathname);
    const compiled = compilePath(namedPath, pathname);
    return compiled;
  } else {
    const {pathname: internalPathname, ...rest} = pathname;
    const namedPath = getNamedPath(internalPathname);
    const compiled = compilePath(namedPath, internalPathname);
    const result: UrlObject = {...rest, pathname: compiled};
    return result;
  }
}

function encodePathname(pathname: string) {
  // Generally, to comply with RFC 3986 and Google's best practices for URL structures
  // (https://developers.google.com/search/docs/crawling-indexing/url-structure),
  // we should always encode non-ASCII characters.
  //
  // There are two places where next-intl interacts with potentially non-ASCII URLs:
  // 1. Middleware: When mapping a localized pathname to a non-localized pathname internally
  // 2. Navigation APIs: When generating a URLs to be used for <Link /> & friends
  //
  // Next.js normalizes incoming pathnames to always be encoded, therefore we can safely
  // decode them there (see middleware.tsx). On the other hand, Next.js doesn't consistently
  // encode non-ASCII characters that are passed to navigation APIs:
  // 1. <Link /> doesn't encode non-ASCII characters
  // 2. useRouter() uses `new URL()` internally, which will encode—but only if necessary
  // 3. redirect() uses useRouter() on the client, but on the server side only
  //    assigns the location header without encoding.
  //
  // In addition to this, for getPathname() we need to encode non-ASCII characters.
  //
  // Therefore, the bottom line is that next-intl should take care of encoding non-ASCII
  // characters in all cases, but can rely on `new URL()` to not double-encode characters.
  return pathname
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
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
      if (
        matchesPathname(
          getLocalizedTemplate(
            localizedPathnamesOrPathname,
            locale,
            internalPathname
          ),
          decoded
        )
      ) {
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
      shouldPrefix = routing.domains
        ? // Since locales are unique per domain, any locale that is a
          // default locale of a domain doesn't require a prefix
          !routing.domains.some((cur) => cur.defaultLocale === locale)
        : locale !== routing.defaultLocale;
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

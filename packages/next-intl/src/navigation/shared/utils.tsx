import type {ParsedUrlQueryInput} from 'node:querystring';
import type {UrlObject} from 'url';
import NextLink from 'next/link';
import {ComponentProps} from 'react';
import {Locales, Pathnames} from '../../routing/types';
import {matchesPathname, prefixPathname} from '../../shared/utils';
import StrictParams from './StrictParams';

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

export type HrefOrUrlObjectWithParams<Pathname> = HrefOrHrefWithParamsImpl<
  Pathname,
  Omit<UrlObject, 'pathname'>
>;

export type HrefOrHrefWithParams<Pathname> = HrefOrHrefWithParamsImpl<
  Pathname,
  {query?: Record<string, SearchParamValue>}
>;

export function normalizeNameOrNameWithParams<Pathname>(
  href: HrefOrHrefWithParams<Pathname>
): {
  pathname: Pathname;
  params?: StrictParams<Pathname>;
} {
  // @ts-expect-error -- `extends string` in the generic unfortunately weakens the type
  return typeof href === 'string' ? {pathname: href as Pathname} : href;
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
        if (Array.isArray(value)) {
          compiled = compiled.replace(
            new RegExp(`(\\[)?\\[...${key}\\](\\])?`, 'g'),
            value.map((v) => String(v)).join('/')
          );
        } else {
          compiled = compiled.replace(`[${key}]`, String(value));
        }
      });
    }

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

export function getRoute<AppLocales extends Locales>({
  locale,
  pathname,
  pathnames
}: {
  locale: AppLocales[number];
  pathname: string;
  pathnames: Pathnames<AppLocales>;
}) {
  const decoded = decodeURI(pathname);

  let template = Object.entries(pathnames).find(([, routePath]) => {
    const routePathname =
      typeof routePath !== 'string' ? routePath[locale] : routePath;
    return matchesPathname(routePathname, decoded);
  })?.[0];

  if (!template) {
    template = pathname;
  }

  return template as keyof Pathnames<AppLocales>;
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

type Href = ComponentProps<typeof NextLink>['href'];

function isRelativeHref(href: Href) {
  const pathname = typeof href === 'object' ? href.pathname : href;
  return pathname != null && !pathname.startsWith('/');
}

export function isLocalHref(href: Href) {
  if (typeof href === 'object') {
    return href.host == null && href.hostname == null;
  } else {
    const hasProtocol = /^[a-z]+:/i.test(href);
    return !hasProtocol;
  }
}

export function isLocalizableHref(href: Href) {
  return isLocalHref(href) && !isRelativeHref(href);
}

export function localizeHref(
  href: string,
  locale: string,
  curLocale: string,
  curPathname: string,
  prefix: string
): string;
export function localizeHref(
  href: UrlObject | string,
  locale: string,
  curLocale: string,
  curPathname: string,
  prefix: string
): UrlObject | string;
export function localizeHref(
  href: UrlObject | string,
  locale: string,
  curLocale: string = locale,
  curPathname: string,
  prefix: string
) {
  if (!isLocalizableHref(href)) {
    return href;
  }

  const isSwitchingLocale = locale !== curLocale;
  const isPathnamePrefixed = hasPathnamePrefixed(prefix, curPathname);
  const shouldPrefix = isSwitchingLocale || isPathnamePrefixed;

  if (shouldPrefix && prefix != null) {
    return prefixHref(href, prefix);
  }

  return href;
}

export function prefixHref(href: string, prefix: string): string;
export function prefixHref(
  href: UrlObject | string,
  prefix: string
): UrlObject | string;
export function prefixHref(href: UrlObject | string, prefix: string) {
  let prefixedHref;
  if (typeof href === 'string') {
    prefixedHref = prefixPathname(prefix, href);
  } else {
    prefixedHref = {...href};
    if (href.pathname) {
      prefixedHref.pathname = prefixPathname(prefix, href.pathname);
    }
  }

  return prefixedHref;
}

export function unprefixPathname(pathname: string, prefix: string) {
  return pathname.replace(new RegExp(`^${prefix}`), '') || '/';
}

export function hasPathnamePrefixed(prefix: string, pathname: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

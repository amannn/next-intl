import type {ParsedUrlQueryInput} from 'node:querystring';
import type {UrlObject} from 'url';
import {AllLocales, Pathnames} from '../shared/types';
import {matchesPathname, unlocalizePathname} from '../shared/utils';
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
  Locales extends AllLocales,
  Pathname
>(opts: {
  locale: Locales[number];
  pathname: Pathname;
  params?: StrictParams<Pathname>;
  pathnames: Pathnames<Locales>;
  query?: Record<string, SearchParamValue>;
}): string;
export function compileLocalizedPathname<
  Locales extends AllLocales,
  Pathname
>(opts: {
  locale: Locales[number];
  pathname: StrictUrlObject<Pathname>;
  params?: StrictParams<Pathname>;
  pathnames: Pathnames<Locales>;
  query?: Record<string, SearchParamValue>;
}): UrlObject;
export function compileLocalizedPathname<Locales extends AllLocales, Pathname>({
  pathname,
  locale,
  params,
  pathnames,
  query
}: {
  locale: Locales[number];
  pathname: keyof typeof pathnames | StrictUrlObject<keyof typeof pathnames>;
  params?: StrictParams<Pathname>;
  pathnames: Pathnames<Locales>;
  query?: Record<string, SearchParamValue>;
}) {
  function getNamedPath(value: keyof typeof pathnames) {
    let namedPath = pathnames[value];
    if (!namedPath) {
      namedPath = value;
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `No route found for "${value}". Available routes: ${Object.keys(
            pathnames
          ).join(', ')}`
        )
      }
    }
    return namedPath;
  }

  function compilePath(
    namedPath: Pathnames<Locales>[keyof Pathnames<Locales>]
  ) {
    let compiled =
      typeof namedPath === 'string' ? namedPath : namedPath[locale];

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

export function getRoute<Locales extends AllLocales>({
  locale,
  pathname,
  pathnames
}: {
  locale: Locales[number];
  pathname: string;
  pathnames: Pathnames<Locales>;
}) {
  pathname = unlocalizePathname(pathname, locale);

  let template = Object.entries(pathnames).find(([, routePath]) => {
    const routePathname =
      typeof routePath !== 'string' ? routePath[locale] : routePath;
    return matchesPathname(routePathname, pathname);
  })?.[0];

  if (!template) {
    template = pathname;
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `No route found for "${pathname}". Available routes: ${Object.keys(
          pathnames
        ).join(', ')}`
      )
    }
  }

  return template as keyof Pathnames<Locales>;
}

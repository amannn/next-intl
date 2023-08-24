import type {ParsedUrlQueryInput} from 'node:querystring';
import type {UrlObject} from 'url';
import {AllLocales, Pathnames, StrictUrlObject} from '../shared/types';
import {matchesPathname, unlocalizePathname} from '../shared/utils';
import StrictParams from './StrictParams';

type SearchParamValue = ParsedUrlQueryInput[keyof ParsedUrlQueryInput];

export type LinkParams<Pathname> = Pathname extends `${string}[[...${string}`
  ? // Optional catch-all
    {params?: StrictParams<Pathname>}
  : Pathname extends `${string}[${string}`
  ? // Required catch-all & regular params
    {params: StrictParams<Pathname>}
  : // No params
    object;

export type HrefOrHrefWithParams<Pathname> =
  Pathname extends `${string}[${string}`
    ? {
        pathname: Pathname;
        params: StrictParams<Pathname>;
        query?: Record<string, SearchParamValue>;
      }
    :
        | Pathname
        | {
            pathname: Pathname;
            query?: Record<string, SearchParamValue>;
          };

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
    const namedPath = pathnames[value];
    if (!namedPath) {
      throw new Error(
        process.env.NODE_ENV !== 'production'
          ? `No route found for "${value}". Available routes: ${Object.keys(
              pathnames
            ).join(', ')}`
          : undefined
      );
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

  const template = Object.entries(pathnames).find(([, routePath]) => {
    const routePathname =
      typeof routePath !== 'string' ? routePath[locale] : routePath;
    return matchesPathname(routePathname, pathname);
  })?.[0];

  if (!template) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? `No route found for "${pathname}". Available routes: ${Object.keys(
            pathnames
          ).join(', ')}`
        : undefined
    );
  }

  return template as keyof Pathnames<Locales>;
}

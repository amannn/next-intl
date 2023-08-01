import type {UrlObject} from 'url';
import {AllLocales, Pathnames, StrictUrlObject} from '../shared/types';
import StrictParams from './StrictParams';

export type HrefOrHrefWithParams<Pathname> =
  Pathname extends `${string}[${string}`
    ? {
        pathname: Pathname;
        params: StrictParams<Pathname>;
      }
    : Pathname;

export function normalizeNameOrNameWithParams<Pathname>(
  href: HrefOrHrefWithParams<Pathname>
): {
  pathname: Pathname;
  params?: StrictParams<Pathname>;
} {
  // @ts-expect-error -- `extends string` in the generic unfortunately weakens the type
  return typeof href === 'string' ? {pathname: href as Pathname} : href;
}

export function compileLocalizedPathname<
  Locales extends AllLocales,
  Pathname
>(opts: {
  locale: Locales[number];
  pathname: Pathname;
  params?: StrictParams<Pathname>;
  pathnames: Pathnames<Locales>;
}): string;
export function compileLocalizedPathname<
  Locales extends AllLocales,
  Pathname
>(opts: {
  locale: Locales[number];
  pathname: StrictUrlObject<Pathname>;
  params?: StrictParams<Pathname>;
  pathnames: Pathnames<Locales>;
}): UrlObject;
export function compileLocalizedPathname<Locales extends AllLocales, Pathname>({
  pathname,
  locale,
  params,
  pathnames
}: {
  locale: Locales[number];
  pathname: keyof typeof pathnames | StrictUrlObject<keyof typeof pathnames>;
  params?: StrictParams<Pathname>;
  pathnames: Pathnames<Locales>;
}) {
  function getNamedPath(value: keyof typeof pathnames) {
    const namedPath = pathnames[value];
    if (!namedPath) {
      throw new Error(
        `No named route found for "${value}". Available routes: ${Object.keys(
          pathnames
        ).join(', ')}`
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
        compiled = compiled.replace(`[${key}]`, String(value));
      });
    }
    // Error handling if there are unresolved params

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
  // TODO: Consider params
  const routeName = Object.entries(pathnames).find(
    ([, routePath]) =>
      (typeof routePath !== 'string' ? routePath[locale] : routePath) ===
      pathname
  )?.[0];

  if (!routeName) {
    throw new Error(
      `No named route found for "${pathname}". Available routes: ${Object.keys(
        pathnames
      ).join(', ')}`
    );
  }

  // TODO: Fix typing with const assertion
  return routeName as keyof Pathnames<Locales>;
}

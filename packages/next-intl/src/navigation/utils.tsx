import type {UrlObject} from 'url';
import {AllLocales, Pathnames, StrictUrlObject} from '../shared/types';

// TODO: Remove this in favor of StrictParams
export type Params = Record<string, string | number | boolean>;

export function compileLocalizedPathname<Locales extends AllLocales>(opts: {
  locale: Locales[number];
  // eslint-disable-next-line no-use-before-define -- False positive
  pathname: keyof typeof opts.pathnames;
  params?: Params;
  pathnames: Pathnames<Locales>;
}): string;
export function compileLocalizedPathname<Locales extends AllLocales>(opts: {
  locale: Locales[number];
  // eslint-disable-next-line no-use-before-define -- False positive
  pathname: StrictUrlObject<keyof typeof opts.pathnames>;
  params?: Params;
  pathnames: Pathnames<Locales>;
}): UrlObject;
export function compileLocalizedPathname<Locales extends AllLocales>({
  pathname,
  locale,
  params,
  pathnames
}: {
  locale: Locales[number];
  pathname: keyof typeof pathnames | StrictUrlObject<keyof typeof pathnames>;
  params?: Params;
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

export function getNamedRoute<Locales extends AllLocales>({
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

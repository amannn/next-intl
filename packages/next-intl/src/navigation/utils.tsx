import {AllLocales, Pathnames} from '../shared/types';

// TODO: Can we type this?
export type Params = Record<string, string>;

export function compileNamedRoute<Locales extends AllLocales>({
  href: name,
  locale,
  params,
  pathnames
}: {
  locale: Locales[number];
  href: keyof Pathnames<Locales>;
  params?: Params;
  pathnames: Pathnames<Locales>;
}) {
  const namedPath = pathnames[name];

  if (!namedPath) {
    throw new Error(
      `No named route found for "${name}". Available routes: ${Object.keys(
        pathnames
      ).join(', ')}`
    );
  }

  const href = typeof namedPath === 'string' ? namedPath : namedPath[locale];
  if (params) {
    // Object.keys(params).forEach((param) => {
    //   href = href.replace(
    //     new RegExp(':' + param, 'g'),
    //     (params as any)[param]
    //   );
    // });
  }

  return href;
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

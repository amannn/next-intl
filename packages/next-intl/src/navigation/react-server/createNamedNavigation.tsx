import React, {ComponentProps} from 'react';
import BaseLink from '../../link/react-server';
import {redirect as baseRedirect} from '../../server';
import getLocaleFromHeader from '../../server/getLocaleFromHeader';
import {AllLocales, ParametersExceptFirst, Pathnames} from '../../shared/types';
import {Params, compileNamedRoute} from '../utils';

export default function createNamedNavigation<Locales extends AllLocales>({
  locales,
  pathnames
}: {
  locales: Locales;
  pathnames: Pathnames<Locales>;
}) {
  function Link({
    href,
    locale,
    params,
    ...rest
  }: Omit<ComponentProps<typeof BaseLink>, 'href' | 'name'> & {
    href: keyof Pathnames<Locales>;
    params?: Params;
    locale?: Locales[number];
  }) {
    const defaultLocale = getLocaleFromHeader() as (typeof locales)[number];
    const finalLocale = locale || defaultLocale;

    return (
      <BaseLink
        href={compileNamedRoute({
          locale: finalLocale,
          href,
          params,
          pathnames
        })}
        {...rest}
      />
    );
  }

  function redirect(
    nameOrNameWithParams:
      | keyof Pathnames<Locales>
      | {
          name: keyof Pathnames<Locales>;
          params?: Params;
        },
    ...args: ParametersExceptFirst<typeof baseRedirect>
  ) {
    const {name, params} =
      typeof nameOrNameWithParams === 'string'
        ? {name: nameOrNameWithParams, params: undefined}
        : nameOrNameWithParams;

    const locale = getLocaleFromHeader();
    const href = compileNamedRoute({
      locale,
      href: name,
      params,
      pathnames
    });

    return baseRedirect(href, ...args);
  }

  function notSupported(message: string) {
    throw new Error(
      `\`${message}\` is not supported in Server Components. You can use this hook if you convert the component to a Client Component.`
    );
  }

  return {
    Link,
    redirect,
    usePathname: notSupported('usePathname'),
    useRouter: notSupported('useRouter')
  };
}

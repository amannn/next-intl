import React, {ComponentProps} from 'react';
import BaseLink from '../../link/react-server';
import getLocaleFromHeader from '../../server/getLocaleFromHeader';
import {redirect as baseRedirect} from '../../server.react-server';
import {
  AllLocales,
  HrefOrUrlObject,
  ParametersExceptFirst,
  Pathnames
} from '../../shared/types';
import StrictParams from '../StrictParams';
import {
  HrefOrHrefWithParams,
  compileLocalizedPathname,
  normalizeNameOrNameWithParams
} from '../utils';

export default function createLocalizedPathnamesNavigation<
  Locales extends AllLocales
>({locales, pathnames}: {locales: Locales; pathnames: Pathnames<Locales>}) {
  type LinkProps<Pathname extends keyof typeof pathnames> = Omit<
    ComponentProps<typeof BaseLink>,
    'href' | 'name'
  > & {
    href: HrefOrUrlObject<Pathname>;
    params?: StrictParams<Pathname>;
    locale?: Locales[number];
  };
  function Link<Pathname extends keyof typeof pathnames>({
    href,
    locale,
    params,
    ...rest
  }: LinkProps<Pathname>) {
    const defaultLocale = getLocaleFromHeader() as (typeof locales)[number];
    const finalLocale = locale || defaultLocale;

    return (
      <BaseLink
        href={compileLocalizedPathname<Locales, Pathname>({
          locale: finalLocale,
          // @ts-expect-error -- No idea
          pathname: href,
          params,
          pathnames
        })}
        locale={locale}
        {...rest}
      />
    );
  }

  function redirect<Pathname extends keyof typeof pathnames>(
    href: HrefOrHrefWithParams<Pathname>,
    ...args: ParametersExceptFirst<typeof baseRedirect>
  ) {
    const locale = getLocaleFromHeader();
    const resolvedHref = compileLocalizedPathname<Locales, Pathname>({
      ...normalizeNameOrNameWithParams(href),
      locale,
      pathnames
    });
    return baseRedirect(resolvedHref, ...args);
  }

  function notSupported(message: string) {
    return () => {
      throw new Error(
        `\`${message}\` is not supported in Server Components. You can use this hook if you convert the component to a Client Component.`
      );
    };
  }

  return {
    Link,
    redirect,
    usePathname: notSupported('usePathname'),
    useRouter: notSupported('useRouter')
  };
}

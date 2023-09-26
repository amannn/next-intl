import React, {ComponentProps} from 'react';
import {getRequestLocale} from '../../server/RequestLocale';
import {AllLocales, ParametersExceptFirst, Pathnames} from '../../shared/types';
import {
  HrefOrHrefWithParams,
  HrefOrUrlObjectWithParams,
  compileLocalizedPathname,
  normalizeNameOrNameWithParams
} from '../utils';
import BaseLink from './Link';
import baseRedirect from './redirect';

export default function createLocalizedPathnamesNavigation<
  Locales extends AllLocales,
  PathnamesConfig extends Pathnames<Locales>
>({locales, pathnames}: {locales: Locales; pathnames: Pathnames<Locales>}) {
  type LinkProps<Pathname extends keyof PathnamesConfig> = Omit<
    ComponentProps<typeof BaseLink>,
    'href' | 'name'
  > & {
    href: HrefOrUrlObjectWithParams<Pathname>;
    locale?: Locales[number];
  };
  function Link<Pathname extends keyof PathnamesConfig>({
    href,
    locale,
    ...rest
  }: LinkProps<Pathname>) {
    const defaultLocale = getRequestLocale() as (typeof locales)[number];
    const finalLocale = locale || defaultLocale;

    return (
      <BaseLink
        href={compileLocalizedPathname<Locales, Pathname>({
          locale: finalLocale,
          // @ts-expect-error -- This is ok
          pathname: href,
          // @ts-expect-error -- This is ok
          params: typeof href === 'object' ? href.params : undefined,
          pathnames
        })}
        locale={locale}
        {...rest}
      />
    );
  }

  function redirect<Pathname extends keyof PathnamesConfig>(
    href: HrefOrHrefWithParams<Pathname>,
    ...args: ParametersExceptFirst<typeof baseRedirect>
  ) {
    const locale = getRequestLocale();
    const resolvedHref = getPathname({href, locale});
    return baseRedirect(resolvedHref, ...args);
  }

  function getPathname({
    href,
    locale
  }: {
    locale: Locales[number];
    href: HrefOrHrefWithParams<keyof PathnamesConfig>;
  }) {
    return compileLocalizedPathname({
      ...normalizeNameOrNameWithParams(href),
      locale,
      pathnames
    });
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
    getPathname,
    usePathname: notSupported('usePathname'),
    useRouter: notSupported('useRouter')
  };
}

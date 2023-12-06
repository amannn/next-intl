import React, {ComponentProps} from 'react';
import {getRequestLocale} from '../../server/react-server/RequestLocale';
import {
  AllLocales,
  LocalePrefix,
  ParametersExceptFirst,
  Pathnames
} from '../../shared/types';
import {
  HrefOrHrefWithParams,
  HrefOrUrlObjectWithParams,
  compileLocalizedPathname,
  normalizeNameOrNameWithParams
} from '../shared/utils';
import ServerLink from './ServerLink';
import serverRedirect from './serverRedirect';

export default function createLocalizedPathnamesNavigation<
  Locales extends AllLocales,
  PathnamesConfig extends Pathnames<Locales>
>({
  localePrefix,
  locales,
  pathnames
}: {
  locales: Locales;
  pathnames: Pathnames<Locales>;
  localePrefix?: LocalePrefix;
}) {
  type LinkProps<Pathname extends keyof PathnamesConfig> = Omit<
    ComponentProps<typeof ServerLink>,
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
      <ServerLink
        href={compileLocalizedPathname<Locales, Pathname>({
          locale: finalLocale,
          // @ts-expect-error -- This is ok
          pathname: href,
          // @ts-expect-error -- This is ok
          params: typeof href === 'object' ? href.params : undefined,
          pathnames
        })}
        locale={locale}
        localePrefix={localePrefix}
        {...rest}
      />
    );
  }

  function redirect<Pathname extends keyof PathnamesConfig>(
    href: HrefOrHrefWithParams<Pathname>,
    ...args: ParametersExceptFirst<typeof serverRedirect>
  ) {
    const locale = getRequestLocale();
    const pathname = getPathname({href, locale});
    return serverRedirect({localePrefix, pathname}, ...args);
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

  function notSupported(hookName: string) {
    return () => {
      throw new Error(
        `\`${hookName}\` is not supported in Server Components. You can use this hook if you convert the component to a Client Component.`
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

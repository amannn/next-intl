import React, {ComponentProps} from 'react';
import {AllLocales, Pathnames} from '../../routing/types';
import {getRequestLocale} from '../../server/react-server/RequestLocale';
import {ParametersExceptFirst} from '../../shared/types';
import {
  LocalizedNavigationRoutingConfigInput,
  receiveLocalizedNavigationRoutingConfig
} from '../shared/config';
import {
  HrefOrHrefWithParams,
  HrefOrUrlObjectWithParams,
  compileLocalizedPathname,
  normalizeNameOrNameWithParams
} from '../shared/utils';
import ServerLink from './ServerLink';
import {serverPermanentRedirect, serverRedirect} from './redirects';

export default function createLocalizedPathnamesNavigation<
  Locales extends AllLocales,
  AppPathnames extends Pathnames<Locales>
>(input: LocalizedNavigationRoutingConfigInput<Locales, AppPathnames>) {
  const config = receiveLocalizedNavigationRoutingConfig(input);

  type LinkProps<Pathname extends keyof AppPathnames> = Omit<
    ComponentProps<typeof ServerLink>,
    'href' | 'name' | 'localePrefix'
  > & {
    href: HrefOrUrlObjectWithParams<Pathname>;
    locale?: Locales[number];
  };
  function Link<Pathname extends keyof AppPathnames>({
    href,
    locale,
    ...rest
  }: LinkProps<Pathname>) {
    const defaultLocale = getRequestLocale() as (typeof config.locales)[number];
    const finalLocale = locale || defaultLocale;

    return (
      <ServerLink
        href={compileLocalizedPathname<Locales, Pathname>({
          locale: finalLocale,
          // @ts-expect-error -- This is ok
          pathname: href,
          // @ts-expect-error -- This is ok
          params: typeof href === 'object' ? href.params : undefined,
          pathnames: config.pathnames
        })}
        locale={locale}
        localePrefix={config.localePrefix}
        {...rest}
      />
    );
  }

  function redirect<Pathname extends keyof AppPathnames>(
    href: HrefOrHrefWithParams<Pathname>,
    ...args: ParametersExceptFirst<typeof serverRedirect>
  ) {
    const locale = getRequestLocale();
    const pathname = getPathname({href, locale});
    return serverRedirect(
      {localePrefix: config.localePrefix, pathname},
      ...args
    );
  }

  function permanentRedirect<Pathname extends keyof AppPathnames>(
    href: HrefOrHrefWithParams<Pathname>,
    ...args: ParametersExceptFirst<typeof serverPermanentRedirect>
  ) {
    const locale = getRequestLocale();
    const pathname = getPathname({href, locale});
    return serverPermanentRedirect(
      {localePrefix: config.localePrefix, pathname},
      ...args
    );
  }

  function getPathname({
    href,
    locale
  }: {
    locale: Locales[number];
    href: HrefOrHrefWithParams<keyof AppPathnames>;
  }) {
    return compileLocalizedPathname({
      ...normalizeNameOrNameWithParams(href),
      locale,
      pathnames: config.pathnames
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
    permanentRedirect,
    getPathname,
    usePathname: notSupported('usePathname'),
    useRouter: notSupported('useRouter')
  };
}

import React, {ComponentProps} from 'react';
import {
  receiveRoutingConfig,
  RoutingConfigLocalizedNavigation
} from '../../routing/config';
import {
  DomainsConfig,
  LocalePrefixMode,
  Locales,
  Pathnames
} from '../../routing/types';
import {getRequestLocale} from '../../server/react-server/RequestLocaleLegacy';
import {ParametersExceptFirst} from '../../shared/types';
import {
  HrefOrHrefWithParams,
  HrefOrUrlObjectWithParams,
  compileLocalizedPathname,
  normalizeNameOrNameWithParams
} from '../shared/utils';
import ServerLink from './ServerLink';
import {serverPermanentRedirect, serverRedirect} from './redirects';

export default function createLocalizedPathnamesNavigation<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode = 'always',
  AppPathnames extends Pathnames<AppLocales> = never,
  AppDomains extends DomainsConfig<AppLocales> = never
>(
  routing: RoutingConfigLocalizedNavigation<
    AppLocales,
    AppLocalePrefixMode,
    AppPathnames,
    AppDomains
  >
) {
  const config = receiveRoutingConfig(routing);

  type LinkProps<Pathname extends keyof AppPathnames> = Omit<
    ComponentProps<typeof ServerLink>,
    'href' | 'name' | 'localePrefix' | 'localeCookie'
  > & {
    href: HrefOrUrlObjectWithParams<Pathname>;
    locale?: AppLocales[number];
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
        href={compileLocalizedPathname<AppLocales, Pathname>({
          locale: finalLocale,
          // @ts-expect-error -- This is ok
          pathname: href,
          // @ts-expect-error -- This is ok
          params: typeof href === 'object' ? href.params : undefined,
          pathnames: config.pathnames
        })}
        locale={locale}
        localeCookie={config.localeCookie}
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
    locale: AppLocales[number];
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

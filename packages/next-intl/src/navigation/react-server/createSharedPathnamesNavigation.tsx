import React, {ComponentProps} from 'react';
import {
  receiveLocaleCookie,
  receiveLocalePrefixConfig,
  RoutingConfigSharedNavigation
} from '../../routing/config';
import {DomainsConfig, LocalePrefixMode, Locales} from '../../routing/types';
import {ParametersExceptFirst} from '../../shared/types';
import ServerLink from './ServerLink';
import {serverPermanentRedirect, serverRedirect} from './redirects';

export default function createSharedPathnamesNavigation<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode,
  AppDomains extends DomainsConfig<AppLocales> = never
>(
  routing?: RoutingConfigSharedNavigation<
    AppLocales,
    AppLocalePrefixMode,
    AppDomains
  >
) {
  const localePrefix = receiveLocalePrefixConfig(routing?.localePrefix);
  const localeCookie = receiveLocaleCookie(routing?.localeCookie);

  function notSupported(hookName: string) {
    return () => {
      throw new Error(
        `\`${hookName}\` is not supported in Server Components. You can use this hook if you convert the component to a Client Component.`
      );
    };
  }

  function Link(
    props: Omit<
      ComponentProps<typeof ServerLink<AppLocales, AppLocalePrefixMode>>,
      'localePrefix' | 'localeCookie'
    >
  ) {
    return (
      <ServerLink<AppLocales, AppLocalePrefixMode>
        localeCookie={localeCookie}
        localePrefix={localePrefix}
        {...props}
      />
    );
  }

  function redirect(
    pathname: string,
    ...args: ParametersExceptFirst<typeof serverRedirect>
  ) {
    return serverRedirect({pathname, localePrefix}, ...args);
  }

  function permanentRedirect(
    pathname: string,
    ...args: ParametersExceptFirst<typeof serverPermanentRedirect>
  ) {
    return serverPermanentRedirect({pathname, localePrefix}, ...args);
  }

  return {
    Link,
    redirect,
    permanentRedirect,
    usePathname: notSupported('usePathname'),
    useRouter: notSupported('useRouter')
  };
}

import React, {ComponentProps} from 'react';
import {
  receiveLocalePrefixConfig,
  RoutingConfigSharedNavigation
} from '../../routing/config';
import {Locales} from '../../routing/types';
import {ParametersExceptFirst} from '../../shared/types';
import ServerLink from './ServerLink';
import {serverPermanentRedirect, serverRedirect} from './redirects';

export default function createSharedPathnamesNavigation<
  AppLocales extends Locales
>(routing?: RoutingConfigSharedNavigation<AppLocales, never>) {
  const localePrefix = receiveLocalePrefixConfig(routing?.localePrefix);

  function notSupported(hookName: string) {
    return () => {
      throw new Error(
        `\`${hookName}\` is not supported in Server Components. You can use this hook if you convert the component to a Client Component.`
      );
    };
  }

  function Link(
    props: Omit<
      ComponentProps<typeof ServerLink<AppLocales>>,
      'localePrefix' | 'locales'
    >
  ) {
    return <ServerLink<AppLocales> localePrefix={localePrefix} {...props} />;
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

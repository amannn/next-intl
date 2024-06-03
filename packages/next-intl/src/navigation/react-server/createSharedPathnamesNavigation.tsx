import React, {ComponentProps} from 'react';
import {Locales} from '../../routing/types';
import {ParametersExceptFirst} from '../../shared/types';
import {
  SharedNavigationRoutingConfigInput,
  receiveSharedNavigationRoutingConfig
} from '../shared/config';
import ServerLink from './ServerLink';
import {serverPermanentRedirect, serverRedirect} from './redirects';

export default function createSharedPathnamesNavigation<
  AppLocales extends Locales
>(input?: SharedNavigationRoutingConfigInput<AppLocales>) {
  const config = receiveSharedNavigationRoutingConfig(input);

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
    return (
      <ServerLink<AppLocales> localePrefix={config.localePrefix} {...props} />
    );
  }

  function redirect(
    pathname: string,
    ...args: ParametersExceptFirst<typeof serverRedirect>
  ) {
    return serverRedirect(
      {pathname, localePrefix: config.localePrefix},
      ...args
    );
  }

  function permanentRedirect(
    pathname: string,
    ...args: ParametersExceptFirst<typeof serverPermanentRedirect>
  ) {
    return serverPermanentRedirect(
      {pathname, localePrefix: config.localePrefix},
      ...args
    );
  }

  return {
    Link,
    redirect,
    permanentRedirect,
    usePathname: notSupported('usePathname'),
    useRouter: notSupported('useRouter')
  };
}

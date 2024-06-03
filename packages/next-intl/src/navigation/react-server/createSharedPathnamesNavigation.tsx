import React, {ComponentProps} from 'react';
import {AllLocales} from '../../routing/types';
import {ParametersExceptFirst} from '../../shared/types';
import {
  SharedNavigationRoutingConfigInput,
  receiveSharedNavigationRoutingConfig
} from '../shared/config';
import ServerLink from './ServerLink';
import {serverPermanentRedirect, serverRedirect} from './redirects';

export default function createSharedPathnamesNavigation<
  Locales extends AllLocales
>(input?: SharedNavigationRoutingConfigInput<Locales>) {
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
      ComponentProps<typeof ServerLink<Locales>>,
      'localePrefix' | 'locales'
    >
  ) {
    return (
      <ServerLink<Locales> localePrefix={config.localePrefix} {...props} />
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

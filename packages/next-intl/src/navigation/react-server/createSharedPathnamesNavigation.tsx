import React, {ComponentProps} from 'react';
import {
  AllLocales,
  LocalePrefix,
  ParametersExceptFirst,
  RoutingLocales
} from '../../shared/types';
import ServerLink from './ServerLink';
import {serverPermanentRedirect, serverRedirect} from './redirects';

export default function createSharedPathnamesNavigation<
  Locales extends AllLocales
>(opts?: {locales?: RoutingLocales<Locales>; localePrefix?: LocalePrefix}) {
  function notSupported(hookName: string) {
    return () => {
      throw new Error(
        `\`${hookName}\` is not supported in Server Components. You can use this hook if you convert the component to a Client Component.`
      );
    };
  }

  function Link(props: ComponentProps<typeof ServerLink<Locales>>) {
    return (
      <ServerLink<Locales>
        localePrefix={opts?.localePrefix}
        locales={opts?.locales}
        {...props}
      />
    );
  }

  function redirect(
    pathname: string,
    ...args: ParametersExceptFirst<typeof serverRedirect>
  ) {
    return serverRedirect({...opts, pathname, locales: opts?.locales}, ...args);
  }

  function permanentRedirect(
    pathname: string,
    ...args: ParametersExceptFirst<typeof serverPermanentRedirect>
  ) {
    return serverPermanentRedirect(
      {...opts, pathname, locales: opts?.locales},
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

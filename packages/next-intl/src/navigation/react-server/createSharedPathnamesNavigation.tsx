import React, {ComponentProps} from 'react';
import {
  AllLocales,
  LocalePrefixConfig,
  ParametersExceptFirst
} from '../../shared/types';
import {receiveLocalePrefixConfig} from '../../shared/utils';
import ServerLink from './ServerLink';
import {serverPermanentRedirect, serverRedirect} from './redirects';

export default function createSharedPathnamesNavigation<
  Locales extends AllLocales
>(opts?: {locales?: Locales; localePrefix?: LocalePrefixConfig<Locales>}) {
  const finalLocalePrefix = receiveLocalePrefixConfig(opts?.localePrefix);

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
    return <ServerLink<Locales> localePrefix={finalLocalePrefix} {...props} />;
  }

  function redirect(
    pathname: string,
    ...args: ParametersExceptFirst<typeof serverRedirect>
  ) {
    return serverRedirect(
      {...opts, pathname, localePrefix: finalLocalePrefix},
      ...args
    );
  }

  function permanentRedirect(
    pathname: string,
    ...args: ParametersExceptFirst<typeof serverPermanentRedirect>
  ) {
    return serverPermanentRedirect(
      {...opts, pathname, localePrefix: finalLocalePrefix},
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

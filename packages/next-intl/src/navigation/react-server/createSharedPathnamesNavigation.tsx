import React, {ComponentProps} from 'react';
import {
  AllLocales,
  LocalePrefix,
  ParametersExceptFirst
} from '../../shared/types';
import ServerLink from './ServerLink';
import serverRedirect from './serverRedirect';

export default function createSharedPathnamesNavigation<
  Locales extends AllLocales
>(opts: {locales: Locales; localePrefix?: LocalePrefix}) {
  function notSupported(message: string) {
    return () => {
      throw new Error(
        `\`${message}\` is not supported in Server Components. You can use this hook if you convert the component to a Client Component.`
      );
    };
  }

  function Link(props: ComponentProps<typeof ServerLink<Locales>>) {
    return <ServerLink<Locales> localePrefix={opts.localePrefix} {...props} />;
  }

  function redirect(
    pathname: string,
    ...args: ParametersExceptFirst<typeof serverRedirect>
  ) {
    return serverRedirect({...opts, pathname}, ...args);
  }

  return {
    Link,
    redirect,
    usePathname: notSupported('usePathname'),
    useRouter: notSupported('useRouter')
  };
}

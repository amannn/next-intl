import React, {ComponentProps} from 'react';
import {AllLocales, LocalePrefix} from '../../shared/types';
import BaseLink from './BaseLink';
import baseRedirect from './baseRedirect';

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

  function Link(props: ComponentProps<typeof BaseLink<Locales>>) {
    return <BaseLink<Locales> localePrefix={opts.localePrefix} {...props} />;
  }

  return {
    Link,
    redirect: baseRedirect,
    usePathname: notSupported('usePathname'),
    useRouter: notSupported('useRouter')
  };
}

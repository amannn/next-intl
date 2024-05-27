import React, {ComponentProps, ReactElement, forwardRef} from 'react';
import {
  AllLocales,
  LocalePrefixConfig,
  ParametersExceptFirst
} from '../../shared/types';
import {receiveLocalePrefixConfig} from '../../shared/utils';
import ClientLink from './ClientLink';
import {clientRedirect, clientPermanentRedirect} from './redirects';
import useBasePathname from './useBasePathname';
import useBaseRouter from './useBaseRouter';

export default function createSharedPathnamesNavigation<
  Locales extends AllLocales
>(opts?: {locales?: Locales; localePrefix?: LocalePrefixConfig<Locales>}) {
  const finalLocalePrefix = receiveLocalePrefixConfig(opts?.localePrefix);

  type LinkProps = Omit<
    ComponentProps<typeof ClientLink<Locales>>,
    'localePrefix'
  >;
  function Link(props: LinkProps, ref: LinkProps['ref']) {
    return (
      <ClientLink<Locales>
        ref={ref}
        localePrefix={finalLocalePrefix}
        {...props}
      />
    );
  }
  const LinkWithRef = forwardRef(Link) as (
    props: LinkProps & {ref?: LinkProps['ref']}
  ) => ReactElement;
  (LinkWithRef as any).displayName = 'Link';

  function redirect(
    pathname: string,
    ...args: ParametersExceptFirst<typeof clientRedirect>
  ) {
    return clientRedirect({pathname, localePrefix: finalLocalePrefix}, ...args);
  }

  function permanentRedirect(
    pathname: string,
    ...args: ParametersExceptFirst<typeof clientPermanentRedirect>
  ) {
    return clientPermanentRedirect(
      {pathname, localePrefix: finalLocalePrefix},
      ...args
    );
  }

  function usePathname(): string {
    const result = useBasePathname(finalLocalePrefix);
    // @ts-expect-error -- Mirror the behavior from Next.js, where `null` is returned when `usePathname` is used outside of Next, but the types indicate that a string is always returned.
    return result;
  }

  function useRouter() {
    return useBaseRouter<Locales>(finalLocalePrefix);
  }

  return {
    Link: LinkWithRef,
    redirect,
    permanentRedirect,
    usePathname,
    useRouter
  };
}

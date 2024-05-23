import React, {ComponentProps, ReactElement, forwardRef} from 'react';
import {
  AllLocales,
  LocalePrefix,
  ParametersExceptFirst,
  RoutingLocales
} from '../../shared/types';
import ClientLink from './ClientLink';
import {clientRedirect, clientPermanentRedirect} from './redirects';
import useBasePathname from './useBasePathname';
import useBaseRouter from './useBaseRouter';

export default function createSharedPathnamesNavigation<
  Locales extends AllLocales
>(opts?: {locales?: RoutingLocales<Locales>; localePrefix?: LocalePrefix}) {
  type LinkProps = Omit<
    ComponentProps<typeof ClientLink<Locales>>,
    'localePrefix'
  >;
  function Link(props: LinkProps, ref: LinkProps['ref']) {
    return (
      <ClientLink<Locales>
        ref={ref}
        localePrefix={opts?.localePrefix}
        locales={opts?.locales}
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
    return clientRedirect({...opts, pathname, locales: opts?.locales}, ...args);
  }

  function permanentRedirect(
    pathname: string,
    ...args: ParametersExceptFirst<typeof clientPermanentRedirect>
  ) {
    return clientPermanentRedirect(
      {...opts, pathname, locales: opts?.locales},
      ...args
    );
  }

  function usePathname(): string {
    const result = useBasePathname(opts?.locales);
    // @ts-expect-error -- Mirror the behavior from Next.js, where `null` is returned when `usePathname` is used outside of Next, but the types indicate that a string is always returned.
    return result;
  }

  function useRouter() {
    return useBaseRouter<Locales>(opts?.locales);
  }

  return {
    Link: LinkWithRef,
    redirect,
    permanentRedirect,
    usePathname,
    useRouter
  };
}

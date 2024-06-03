import React, {ComponentProps, ReactElement, forwardRef} from 'react';
import {Locales} from '../../routing/types';
import {ParametersExceptFirst} from '../../shared/types';
import {
  SharedNavigationRoutingConfigInput,
  receiveSharedNavigationRoutingConfig
} from '../shared/config';
import ClientLink from './ClientLink';
import {clientRedirect, clientPermanentRedirect} from './redirects';
import useBasePathname from './useBasePathname';
import useBaseRouter from './useBaseRouter';

export default function createSharedPathnamesNavigation<
  const AppLocales extends Locales
>(input?: SharedNavigationRoutingConfigInput<AppLocales>) {
  const config = receiveSharedNavigationRoutingConfig(input);

  type LinkProps = Omit<
    ComponentProps<typeof ClientLink<AppLocales>>,
    'localePrefix'
  >;
  function Link(props: LinkProps, ref: LinkProps['ref']) {
    return (
      <ClientLink<AppLocales>
        ref={ref}
        localePrefix={config.localePrefix}
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
    return clientRedirect(
      {pathname, localePrefix: config.localePrefix},
      ...args
    );
  }

  function permanentRedirect(
    pathname: string,
    ...args: ParametersExceptFirst<typeof clientPermanentRedirect>
  ) {
    return clientPermanentRedirect(
      {pathname, localePrefix: config.localePrefix},
      ...args
    );
  }

  function usePathname(): string {
    const result = useBasePathname(config.localePrefix);
    // @ts-expect-error -- Mirror the behavior from Next.js, where `null` is returned when `usePathname` is used outside of Next, but the types indicate that a string is always returned.
    return result;
  }

  function useRouter() {
    return useBaseRouter<AppLocales>(config.localePrefix);
  }

  return {
    Link: LinkWithRef,
    redirect,
    permanentRedirect,
    usePathname,
    useRouter
  };
}

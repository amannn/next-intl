import React, {ComponentProps, ReactElement, forwardRef} from 'react';
import {
  receiveLocalePrefixConfig,
  RoutingConfigSharedNavigation
} from '../../routing/config';
import {DomainsConfig, LocalePrefixMode, Locales} from '../../routing/types';
import {ParametersExceptFirst} from '../../shared/types';
import ClientLink from './ClientLink';
import {clientRedirect, clientPermanentRedirect} from './redirects';
import useBasePathname from './useBasePathname';
import useBaseRouter from './useBaseRouter';

/**
 * @deprecated Consider switching to `createNavigation` (see https://github.com/amannn/next-intl/pull/1316)
 **/
export default function createSharedPathnamesNavigation<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode,
  AppDomains extends DomainsConfig<AppLocales> = never
>(
  routing?: RoutingConfigSharedNavigation<
    AppLocales,
    AppLocalePrefixMode,
    AppDomains
  >
) {
  const localePrefix = receiveLocalePrefixConfig(routing?.localePrefix);

  type LinkProps = Omit<
    ComponentProps<typeof ClientLink<AppLocales, AppLocalePrefixMode>>,
    'localePrefix'
  >;
  function Link(props: LinkProps, ref: LinkProps['ref']) {
    return (
      <ClientLink<AppLocales, AppLocalePrefixMode>
        ref={ref}
        localePrefix={localePrefix}
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
    return clientRedirect({pathname, localePrefix}, ...args);
  }

  function permanentRedirect(
    pathname: string,
    ...args: ParametersExceptFirst<typeof clientPermanentRedirect>
  ) {
    return clientPermanentRedirect({pathname, localePrefix}, ...args);
  }

  function usePathname(): string {
    const result = useBasePathname(localePrefix);
    // @ts-expect-error -- Mirror the behavior from Next.js, where `null` is returned when `usePathname` is used outside of Next, but the types indicate that a string is always returned.
    return result;
  }

  function useRouter() {
    return useBaseRouter<AppLocales, AppLocalePrefixMode>(localePrefix);
  }

  return {
    Link: LinkWithRef,
    redirect,
    permanentRedirect,
    usePathname,
    useRouter
  };
}

import React, {ComponentProps, ReactElement, forwardRef} from 'react';
import {
  RoutingConfigSharedNavigation,
  receiveLocaleCookie,
  receiveLocalePrefixConfig
} from '../../routing/config';
import {DomainsConfig, LocalePrefixMode, Locales} from '../../routing/types';
import {ParametersExceptFirst} from '../../shared/types';
import ClientLink from './ClientLink';
import {clientPermanentRedirect, clientRedirect} from './redirects';
import useBasePathname from './useBasePathname';
import useBaseRouter from './useBaseRouter';

/**
 * @deprecated Consider switching to `createNavigation` (see https://next-intl-docs.vercel.app/blog/next-intl-3-22#create-navigation)
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
  const localeCookie = receiveLocaleCookie(routing?.localeCookie);

  type LinkProps = Omit<
    ComponentProps<typeof ClientLink<AppLocales, AppLocalePrefixMode>>,
    'localePrefix' | 'localeCookie'
  >;
  function Link(props: LinkProps, ref: LinkProps['ref']) {
    return (
      <ClientLink<AppLocales, AppLocalePrefixMode>
        ref={ref}
        localeCookie={localeCookie}
        localePrefix={localePrefix}
        {...props}
      />
    );
  }
  const LinkWithRef = forwardRef(Link) as unknown as (
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
    const result = useBasePathname({
      localePrefix,
      defaultLocale: routing?.defaultLocale
    });
    // @ts-expect-error -- Mirror the behavior from Next.js, where `null` is returned when `usePathname` is used outside of Next, but the types indicate that a string is always returned.
    return result;
  }

  function useRouter() {
    return useBaseRouter<AppLocales, AppLocalePrefixMode>(
      localePrefix,
      localeCookie
    );
  }

  return {
    Link: LinkWithRef,
    redirect,
    permanentRedirect,
    usePathname,
    useRouter
  };
}

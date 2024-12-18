import {
  usePathname as useNextPathname,
  useRouter as useNextRouter
} from 'next/navigation.js';
import {useMemo} from 'react';
import {type Locale, useLocale} from 'use-intl';
import type {
  RoutingConfigLocalizedNavigation,
  RoutingConfigSharedNavigation
} from '../../routing/config.tsx';
import type {
  DomainsConfig,
  LocalePrefixMode,
  Locales,
  Pathnames
} from '../../routing/types.tsx';
import createSharedNavigationFns from '../shared/createSharedNavigationFns.tsx';
import syncLocaleCookie from '../shared/syncLocaleCookie.tsx';
import {getRoute} from '../shared/utils.tsx';
import useBasePathname from './useBasePathname.tsx';

export default function createNavigation<
  const AppLocales extends Locales,
  const AppLocalePrefixMode extends LocalePrefixMode = 'always',
  const AppPathnames extends Pathnames<AppLocales> = never,
  const AppDomains extends DomainsConfig<AppLocales> = never
>(
  routing?: [AppPathnames] extends [never]
    ?
        | RoutingConfigSharedNavigation<
            AppLocales,
            AppLocalePrefixMode,
            AppDomains
          >
        | undefined
    : RoutingConfigLocalizedNavigation<
        AppLocales,
        AppLocalePrefixMode,
        AppPathnames,
        AppDomains
      >
) {
  const {Link, config, getPathname, ...redirects} = createSharedNavigationFns(
    useLocale,
    routing
  );

  /** @see https://next-intl.dev/docs/routing/navigation#usepathname */
  function usePathname(): [AppPathnames] extends [never]
    ? string
    : keyof AppPathnames {
    const pathname = useBasePathname(config);
    const locale = useLocale();

    // @ts-expect-error -- Mirror the behavior from Next.js, where `null` is returned when `usePathname` is used outside of Next, but the types indicate that a string is always returned.
    return useMemo(
      () =>
        pathname &&
        // @ts-expect-error -- This is fine
        config.pathnames
          ? getRoute(
              locale,
              pathname,
              // @ts-expect-error -- This is fine
              config.pathnames
            )
          : pathname,
      [locale, pathname]
    );
  }

  function useRouter() {
    const router = useNextRouter();
    const curLocale = useLocale();
    const nextPathname = useNextPathname();

    return useMemo(() => {
      function createHandler<
        Options,
        Fn extends (href: string, options?: Options) => void
      >(fn: Fn) {
        return function handler(
          href: Parameters<typeof getPathname>[0]['href'],
          options?: Partial<Options> & {locale?: Locale}
        ): void {
          const {locale: nextLocale, ...rest} = options || {};

          // @ts-expect-error -- We're passing a domain here just in case
          const pathname = getPathname({
            href,
            locale: nextLocale || curLocale,
            domain: window.location.host
          });

          const args: [href: string, options?: Options] = [pathname];
          if (Object.keys(rest).length > 0) {
            // @ts-expect-error -- This is fine
            args.push(rest);
          }

          fn(...args);

          syncLocaleCookie(
            config.localeCookie,
            nextPathname,
            curLocale,
            nextLocale
          );
        };
      }

      return {
        ...router,
        /** @see https://next-intl.dev/docs/routing/navigation#userouter */
        push: createHandler<
          Parameters<typeof router.push>[1],
          typeof router.push
        >(router.push),
        /** @see https://next-intl.dev/docs/routing/navigation#userouter */
        replace: createHandler<
          Parameters<typeof router.replace>[1],
          typeof router.replace
        >(router.replace),
        /** @see https://next-intl.dev/docs/routing/navigation#userouter */
        prefetch: createHandler<
          Parameters<typeof router.prefetch>[1],
          typeof router.prefetch
        >(router.prefetch)
      };
    }, [curLocale, nextPathname, router]);
  }

  return {
    ...redirects,
    Link,
    usePathname,
    useRouter,
    getPathname
  };
}

import {
  usePathname as useNextPathname,
  useRouter as useNextRouter
} from 'next/navigation.js';
import {useMemo} from 'react';
import {type Locale, useLocale} from 'use-intl';
import type {
  RoutingConfigLocalizedNavigation,
  RoutingConfigSharedNavigation
} from '../../routing/config.js';
import type {
  DomainsConfig,
  LocalePrefixMode,
  Locales,
  Pathnames
} from '../../routing/types.js';
import createSharedNavigationFns from '../shared/createSharedNavigationFns.js';
import syncLocaleCookie from '../shared/syncLocaleCookie.js';
import {getRoute} from '../shared/utils.js';
import useBasePathname from './useBasePathname.js';

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

          const pathname = getPathname({
            href,
            locale: nextLocale || curLocale
          });

          const args: [href: string, options?: Options] = [pathname];
          if (Object.keys(rest).length > 0) {
            // @ts-expect-error -- This is fine
            args.push(rest);
          }

          syncLocaleCookie(
            config.localeCookie,
            nextPathname,
            curLocale,
            nextLocale
          );

          fn(...args);
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

import {
  useRouter as useNextRouter,
  usePathname as useNextPathname
} from 'next/navigation';
import React, {ComponentProps, forwardRef, ReactElement, useMemo} from 'react';
import useLocale from '../../react-client/useLocale';
import {
  RoutingConfigLocalizedNavigation,
  RoutingConfigSharedNavigation
} from '../../routing/config';
import {Locales, Pathnames} from '../../routing/types';
import createSharedNavigationFns from '../shared/createSharedNavigationFns';
import syncLocaleCookie from '../shared/syncLocaleCookie';
import {getRoute} from '../shared/utils';
import useBasePathname from './useBasePathname';

export default function createNavigation<
  const AppLocales extends Locales,
  const AppPathnames extends Pathnames<AppLocales> = never
>(
  routing?: [AppPathnames] extends [never]
    ? RoutingConfigSharedNavigation<AppLocales> | undefined
    : RoutingConfigLocalizedNavigation<AppLocales, AppPathnames>
) {
  type Locale = AppLocales extends never ? string : AppLocales[number];

  function useTypedLocale() {
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context here is fine, since this must always be called during render (redirect, useRouter)
    return useLocale() as Locale;
  }

  const {
    Link: BaseLink,
    config,
    getPathname,
    ...redirects
  } = createSharedNavigationFns(useTypedLocale, routing);

  /**
   * Returns the pathname without a potential locale prefix.
   *
   * @see https://next-intl-docs.vercel.app/docs/routing/navigation#usepathname
   */
  function usePathname(): [AppPathnames] extends [never]
    ? string
    : keyof AppPathnames {
    const pathname = useBasePathname(config.localePrefix);
    const locale = useTypedLocale();

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

  type LinkProps = Omit<ComponentProps<typeof BaseLink>, 'nodeRef'>;
  function Link(props: LinkProps, ref: LinkProps['ref']) {
    return <BaseLink nodeRef={ref} {...props} />;
  }
  const LinkWithRef = forwardRef(Link) as (
    props: LinkProps & {ref?: LinkProps['ref']}
  ) => ReactElement;
  (LinkWithRef as any).displayName = 'Link';

  function useRouter() {
    const router = useNextRouter();
    const curLocale = useTypedLocale();
    const nextPathname = useNextPathname();

    return useMemo(() => {
      function createHandler<
        Options,
        Fn extends (href: string, options?: Options) => void
      >(fn: Fn) {
        return function handler(
          href: string,
          options?: Partial<Options> & {locale?: Locale}
        ): void {
          const {locale: nextLocale, ...rest} = options || {};

          const pathname = getPathname({
            // @ts-expect-error -- This is fine
            href,
            locale: nextLocale || curLocale
          });

          const args: [href: string, options?: Options] = [pathname];
          if (Object.keys(rest).length > 0) {
            // @ts-expect-error -- This is fine
            args.push(rest);
          }

          fn(...args);

          syncLocaleCookie(nextPathname, curLocale, nextLocale);
        };
      }

      return {
        ...router,
        push: createHandler<
          Parameters<typeof router.push>[1],
          typeof router.push
        >(router.push),
        replace: createHandler<
          Parameters<typeof router.replace>[1],
          typeof router.replace
        >(router.replace),
        prefetch: createHandler<
          Parameters<typeof router.prefetch>[1],
          typeof router.prefetch
        >(router.prefetch)
      };
    }, [curLocale, nextPathname, router]);
  }

  return {...redirects, Link: LinkWithRef, usePathname, useRouter, getPathname};
}

import {useRouter as useNextRouter, usePathname} from 'next/navigation';
import {useMemo} from 'react';
import useLocale from '../../react-client/useLocale';
import {AllLocales} from '../../shared/types';
import {localizeHref} from '../../shared/utils';
import syncLocaleCookie from '../shared/syncLocaleCookie';
import {getBasePath} from '../shared/utils';

type IntlNavigateOptions<Locales extends AllLocales> = {
  locale?: Locales[number];
};

/**
 * Returns a wrapped instance of `useRouter` from `next/navigation` that
 * will automatically localize the `href` parameters it receives.
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import {useRouter} from 'next-intl/client';
 *
 * const router = useRouter();
 *
 * // When the user is on `/en`, the router will navigate to `/en/about`
 * router.push('/about');
 *
 * // Optionally, you can switch the locale by passing the second argument
 * router.push('/about', {locale: 'de'});
 * ```
 */
export default function useBaseRouter<Locales extends AllLocales>() {
  const router = useNextRouter();
  const locale = useLocale();
  const pathname = usePathname();

  return useMemo(() => {
    function localize(href: string, nextLocale?: string) {
      let curPathname = window.location.pathname;

      const basePath = getBasePath(pathname);
      if (basePath) curPathname = curPathname.replace(basePath, '');

      return localizeHref(href, nextLocale || locale, locale, curPathname);
    }

    function createHandler<
      Options,
      Fn extends (href: string, options?: Options) => void
    >(fn: Fn) {
      return function handler(
        href: string,
        options?: Options & IntlNavigateOptions<Locales>
      ): void {
        const {locale: nextLocale, ...rest} = options || {};

        syncLocaleCookie(pathname, locale, nextLocale);

        const args: [
          href: string,
          options?: Parameters<typeof router.push>[1]
        ] = [localize(href, nextLocale)];
        if (Object.keys(rest).length > 0) {
          args.push(rest);
        }

        // @ts-expect-error -- This is ok
        return fn(...args);
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
  }, [locale, pathname, router]);
}

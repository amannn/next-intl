import {useRouter as useNextRouter} from 'next/navigation';
import {useMemo} from 'react';
import {localizeHref} from '../shared/utils';
import useClientLocale from './useClientLocale';

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
 * ```
 */
export default function useRouter() {
  const router = useNextRouter();
  const locale = useClientLocale();

  return useMemo(() => {
    function localize(href: string) {
      return localizeHref(href, locale, locale, window.location.pathname);
    }

    return {
      ...router,
      push(...[href, ...args]: Parameters<typeof router.push>) {
        return router.push(localize(href), ...args);
      },
      replace(...[href, ...args]: Parameters<typeof router.replace>) {
        return router.replace(localize(href), ...args);
      },
      prefetch(...[href, ...args]: Parameters<typeof router.prefetch>) {
        return router.prefetch(localize(href), ...args);
      }
    };
  }, [locale, router]);
}

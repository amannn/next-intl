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
      push(href: string) {
        return router.push(localize(href));
      },
      replace(href: string) {
        return router.replace(localize(href));
      },
      prefetch(href: string) {
        return router.prefetch(localize(href));
      }
    };
  }, [locale, router]);
}

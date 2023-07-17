import {useRouter as useNextRouter} from 'next/navigation';
import {useMemo} from 'react';
import {localizeHref} from '../shared/utils';
import useClientLocale from './useClientLocale';

type IntlNavigateOptions = {
  locale?: string;
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
export default function useRouter() {
  const router = useNextRouter();
  const locale = useClientLocale();

  return useMemo(() => {
    function localize(href: string, nextLocale?: string) {
      return localizeHref(
        href,
        nextLocale || locale,
        locale,
        window.location.pathname
      );
    }

    return {
      ...router,
      push(
        href: string,
        options?: Parameters<typeof router.push>[1] & IntlNavigateOptions
      ) {
        const {locale: nextLocale, ...rest} = options || {};
        const args: [
          href: string,
          options?: Parameters<typeof router.push>[1]
        ] = [localize(href, nextLocale)];
        if (Object.keys(rest).length > 0) {
          args.push(rest);
        }
        return router.push(...args);
      },

      replace(
        href: string,
        options?: Parameters<typeof router.replace>[1] & IntlNavigateOptions
      ) {
        const {locale: nextLocale, ...rest} = options || {};
        const args: [
          href: string,
          options?: Parameters<typeof router.replace>[1]
        ] = [localize(href, nextLocale)];
        if (Object.keys(rest).length > 0) {
          args.push(rest);
        }
        return router.replace(...args);
      },

      prefetch(
        href: string,
        options?: Parameters<typeof router.prefetch>[1] & IntlNavigateOptions
      ) {
        const {locale: nextLocale, ...rest} = options || {};
        const args: [
          href: string,
          options?: Parameters<typeof router.prefetch>[1]
        ] = [localize(href, nextLocale)];
        if (Object.keys(rest).length > 0) {
          // @ts-expect-error TypeScript thinks `rest` can be an empty object
          args.push(rest);
        }
        return router.prefetch(...args);
      }
    };
  }, [locale, router]);
}

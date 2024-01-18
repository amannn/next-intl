import {useRouter as useNextRouter, usePathname} from 'next/navigation';
import {useMemo} from 'react';
import useLocale from '../../react-client/useLocale';
import {
  COOKIE_LOCALE_NAME,
  COOKIE_MAX_AGE,
  COOKIE_SAME_SITE
} from '../../shared/constants';
import {AllLocales} from '../../shared/types';
import {localizeHref} from '../../shared/utils';

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
      return localizeHref(
        href,
        nextLocale || locale,
        locale,
        window.location.pathname
      );
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

        // We have to keep the cookie value in sync as Next.js might
        // skip a request to the server due to its router cache.
        // See https://github.com/amannn/next-intl/issues/786.
        const isSwitchingLocale = nextLocale !== locale;
        if (isSwitchingLocale) {
          const basePath = window.location.pathname.replace(pathname, '');
          const hasBasePath = basePath !== '';
          const path = hasBasePath ? basePath : '/';

          // Note that writing to `document.cookie` doesn't overwrite all
          // cookies, but only the ones referenced via the name here.
          document.cookie = `${COOKIE_LOCALE_NAME}=${nextLocale}; path=${path}; max-age=${COOKIE_MAX_AGE}; sameSite=${COOKIE_SAME_SITE}`;
        }

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

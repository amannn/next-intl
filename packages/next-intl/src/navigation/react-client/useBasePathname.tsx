'use client';

import {usePathname as useNextPathname} from 'next/navigation';
import {useMemo} from 'react';
import useLocale from '../../react-client/useLocale';
import {AllLocales, RoutingLocales} from '../../shared/types';
import {hasPathnamePrefixed, unlocalizePathname} from '../../shared/utils';
import {getLocalePrefix} from '../shared/utils';

/**
 * Returns the pathname without a potential locale prefix.
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import {usePathname} from 'next-intl/client';
 *
 * // When the user is on `/en`, this will be `/`
 * const pathname = usePathname();
 * ```
 */
export default function useBasePathname<Locales extends AllLocales>(
  locales?: RoutingLocales<Locales>
): string | null {
  // The types aren't entirely correct here. Outside of Next.js
  // `useParams` can be called, but the return type is `null`.
  const pathname = useNextPathname() as ReturnType<
    typeof useNextPathname
  > | null;

  const locale = useLocale();

  return useMemo(() => {
    if (!pathname) return pathname;
    const prefix = getLocalePrefix(locale, locales);
    const isPathnamePrefixed = hasPathnamePrefixed(prefix, pathname);
    const unlocalizedPathname = isPathnamePrefixed
      ? unlocalizePathname(pathname, locale)
      : pathname;

    return unlocalizedPathname;
  }, [locale, locales, pathname]);
}

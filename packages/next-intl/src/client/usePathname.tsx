'use client';

import {usePathname as useNextPathname} from 'next/navigation';
import {useMemo} from 'react';
import {hasPathnamePrefixed, unlocalizePathname} from '../shared/utils';
import useClientLocale from './useClientLocale';

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
export default function usePathname(): string {
  // The types aren't entirely correct here. Outside of Next.js
  // `useParams` can be called, but the return type is `null`.
  const pathname = useNextPathname() as ReturnType<
    typeof useNextPathname
  > | null;

  const locale = useClientLocale();

  return useMemo(() => {
    if (!pathname) return pathname as ReturnType<typeof useNextPathname>;

    const isPathnamePrefixed = hasPathnamePrefixed(locale, pathname);
    const unlocalizedPathname = isPathnamePrefixed
      ? unlocalizePathname(pathname, locale)
      : pathname;

    return unlocalizedPathname;
  }, [locale, pathname]);
}

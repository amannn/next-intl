'use client';

import {usePathname as useNextPathname} from 'next/navigation';
import unlocalizePathname from '../shared/unlocalizePathname';
import hasPathnamePrefixed from './hasPathnamePrefixed';
import useClientLocale from './useClientLocale';

/**
 * Returns the pathname without a potential locale prefix.
 *
 * This can be helpful e.g. to implement navigation links,
 * where the active link is highlighted.
 */
export default function usePathname(): string {
  const pathname = useNextPathname();
  const locale = useClientLocale();

  const isPathnamePrefixed = hasPathnamePrefixed(locale, pathname);
  const unlocalizedPathname = isPathnamePrefixed
    ? unlocalizePathname(pathname, locale)
    : pathname;

  return unlocalizedPathname;
}

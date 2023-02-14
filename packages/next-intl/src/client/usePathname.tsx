'use client';

import {usePathname as useNextPathname} from 'next/navigation';
import {useEffect, useState} from 'react';
import getCookieLocale from './getCookieLocale';
import hasPathnamePrefixed from './hasPathnamePrefixed';

export function unlocalizePathname(pathname: string) {
  return pathname.replace(/^\/[\w_-]+/, '') || '/';
}

/**
 * Returns the pathname without a potential locale prefix.
 *
 * Note that on the server side `null` is returned, only on
 * the client side the correct pathname will be returned.
 *
 * This can be helpful e.g. to implement navigation links,
 * where the active link is highlighted.
 */
export default function usePathname() {
  const pathname = useNextPathname();
  const [unlocalizedPathname, setUnlocalizedPathname] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (pathname == null) {
      setUnlocalizedPathname(pathname);
      return;
    }

    const cookieLocale = getCookieLocale();
    const isPathnamePrefixed = hasPathnamePrefixed(cookieLocale, pathname);

    if (isPathnamePrefixed) {
      setUnlocalizedPathname(unlocalizePathname(pathname));
    } else {
      setUnlocalizedPathname(pathname);
    }
  }, [pathname]);

  return unlocalizedPathname;
}

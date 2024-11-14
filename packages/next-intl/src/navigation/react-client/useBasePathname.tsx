import {usePathname as useNextPathname} from 'next/navigation.js';
import {useMemo} from 'react';
import {useLocale} from 'use-intl';
import type {
  LocalePrefixConfigVerbose,
  LocalePrefixMode,
  Locales
} from '../../routing/types.tsx';
import {
  getLocalePrefix,
  hasPathnamePrefixed,
  unprefixPathname
} from '../../shared/utils.tsx';

export default function useBasePathname<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode
>(localePrefix: LocalePrefixConfigVerbose<AppLocales, AppLocalePrefixMode>) {
  // The types aren't entirely correct here. Outside of Next.js
  // `useParams` can be called, but the return type is `null`.

  // Notes on `useNextPathname`:
  // - Types aren't entirely correct. Outside of Next.js the
  //   hook will return `null` (e.g. unit tests)
  // - A base path is stripped from the result
  // - Rewrites *are* taken into account (i.e. the pathname
  //   that the user sees in the browser is returned)
  const pathname = useNextPathname() as ReturnType<
    typeof useNextPathname
  > | null;

  const locale = useLocale();

  return useMemo(() => {
    if (!pathname) return pathname;

    const prefix = getLocalePrefix(locale, localePrefix);
    const isPathnamePrefixed = hasPathnamePrefixed(prefix, pathname);
    const unlocalizedPathname = isPathnamePrefixed
      ? unprefixPathname(pathname, prefix)
      : pathname;

    return unlocalizedPathname;
  }, [locale, localePrefix, pathname]);
}

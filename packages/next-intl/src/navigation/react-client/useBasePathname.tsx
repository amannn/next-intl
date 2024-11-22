import {usePathname as useNextPathname} from 'next/navigation';
import {useMemo} from 'react';
import useLocale from '../../react-client/useLocale';
import {
  LocalePrefixConfigVerbose,
  LocalePrefixMode,
  Locales
} from '../../routing/types';
import {
  getLocaleAsPrefix,
  getLocalePrefix,
  hasPathnamePrefixed,
  unprefixPathname
} from '../../shared/utils';

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

    let unlocalizedPathname = pathname;

    const prefix = getLocalePrefix(locale, localePrefix);
    const isPathnamePrefixed = hasPathnamePrefixed(prefix, pathname);

    if (isPathnamePrefixed) {
      unlocalizedPathname = unprefixPathname(pathname, prefix);
    } else {
      // https://github.com/vercel/next.js/issues/73085
      const localeAsPrefix = getLocaleAsPrefix(locale);
      if (hasPathnamePrefixed(localeAsPrefix, pathname)) {
        unlocalizedPathname = unprefixPathname(pathname, localeAsPrefix);
      }
    }

    return unlocalizedPathname;
  }, [locale, localePrefix, pathname]);
}

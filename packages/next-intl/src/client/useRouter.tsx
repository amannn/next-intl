import {useRouter as useNextRouter} from 'next/navigation';
import {useMemo} from 'react';
import localizeHref from './localizeHref';
import useClientLocale from './useClientLocale';

export default function useRouter() {
  const router = useNextRouter();
  const locale = useClientLocale();

  return useMemo(
    () => ({
      ...router,
      push(href: string) {
        return router.push(localizeHref(href, locale));
      },
      replace(href: string) {
        return router.replace(localizeHref(href, locale));
      },
      prefetch(href: string) {
        return router.prefetch(localizeHref(href, locale));
      }
    }),
    [locale, router]
  );
}

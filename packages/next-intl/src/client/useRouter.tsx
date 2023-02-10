import {useRouter as useNextRouter} from 'next/navigation';
import {useMemo} from 'react';
import localizeHref from './localizeHref';

export default function useRouter() {
  const router = useNextRouter();

  return useMemo(
    () => ({
      ...router,
      push(href: string) {
        return router.push(localizeHref(href));
      },
      replace(href: string) {
        return router.replace(localizeHref(href));
      },
      prefetch(href: string) {
        return router.prefetch(localizeHref(href));
      }
    }),
    [router]
  );
}

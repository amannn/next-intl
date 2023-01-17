import {useRouter} from 'next/navigation';
import {useMemo} from 'react';
import {COOKIE_LOCALE_NAME} from '../shared/constants';
import localizeHref from '../shared/localizeHref';

function getCookieValueByName(name: string) {
  // https://stackoverflow.com/a/15724300/343045
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const part = parts.pop()?.split(';').shift();
    if (part) return part;
  }

  throw new Error(
    `Unable to find next-intl cookie, have you configured the middleware?`
  );
}

function getCookieLocale() {
  return getCookieValueByName(COOKIE_LOCALE_NAME);
}

export default function useLocalizedRouter() {
  const router = useRouter();

  return useMemo(
    () => ({
      ...router,
      push(href: string) {
        return router.push(localizeHref(getCookieLocale(), href));
      },
      replace(href: string) {
        return router.replace(localizeHref(getCookieLocale(), href));
      },
      prefetch(href: string) {
        return router.prefetch(localizeHref(getCookieLocale(), href));
      }
    }),
    [router]
  );
}

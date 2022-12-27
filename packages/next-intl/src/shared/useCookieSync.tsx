import {useEffect} from 'react';
import {LOCALE_COOKIE_NAME} from './constants';

/**
 * This is necessary so the middleware only has to match
 * on the root path, but we can keep the cookie in sync.
 */
export default function useCookieSync(locale: string) {
  useEffect(() => {
    const cookie = document.cookie
      .split(';')
      .find((cur) => cur.includes(LOCALE_COOKIE_NAME + '='));

    const prevLocale = cookie?.split('=')?.[1];
    if (prevLocale !== locale) {
      document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
    }
  }, [locale]);
}

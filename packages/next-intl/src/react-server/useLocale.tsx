import {cookies, headers} from 'next/headers';
import {COOKIE_LOCALE_NAME, HEADER_LOCALE_NAME} from '../shared/constants';

export default function useLocale() {
  let locale;

  // A header is only set when we're changing the locale,
  // otherwise we reuse an existing one from a cookie.
  const requestHeaders = headers();
  if (requestHeaders.has(HEADER_LOCALE_NAME)) {
    locale = requestHeaders.get(HEADER_LOCALE_NAME);
  } else {
    locale = cookies().get(COOKIE_LOCALE_NAME)?.value;
  }

  if (!locale) {
    throw new Error(
      'Unable to find `next-intl` locale, have you configured the middleware?`'
    );
  }

  return locale;
}

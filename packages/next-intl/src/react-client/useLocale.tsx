import {useLocale as useIntlLocale} from 'use-intl';
import {COOKIE_LOCALE_NAME} from '../shared/constants';

function getCookieValueByName(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  } else {
    return undefined;
  }
}

export default function useLocale() {
  // Shortcut to read the locale from the cookie. This allows to read the
  // locale on the client side without using `NextIntlClientProvider`.
  if (typeof window !== 'undefined') {
    const locale = getCookieValueByName(COOKIE_LOCALE_NAME);
    if (locale) return locale;
  }

  // The condition never changes across runtime
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useIntlLocale();
}

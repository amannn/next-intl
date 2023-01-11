import acceptLanguageParser from 'accept-language-parser';
import {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {COOKIE_LOCALE_NAME} from '../shared/constants';
import NextIntlConfig from './NextIntlConfig';

export default function resolveLocale(
  i18n: NextIntlConfig,
  requestHeaders: Headers,
  requestCookies: RequestCookies,
  pathname: string
) {
  let locale;

  // Prio 1: Use route prefix
  if (pathname) {
    const segments = pathname.split('/');
    if (segments.length > 1) {
      const segment = segments[1];
      if (i18n.locales.includes(segment)) {
        locale = segment;
      }
    }
  }

  // Prio 2: Use existing cookie
  if (!locale && requestCookies) {
    if (requestCookies.has(i18n.cookieName || COOKIE_LOCALE_NAME)) {
      locale = requestCookies.get(i18n.cookieName || COOKIE_LOCALE_NAME)?.value;
    }
  }

  // Prio 3: Use accept-language header
  if (!locale && requestHeaders) {
    locale =
      acceptLanguageParser.pick(
        i18n.locales,
        requestHeaders.get('accept-language') || i18n.defaultLocale
      ) || i18n.defaultLocale;
  }

  // Prio 4: Use default locale
  if (!locale) {
    locale = i18n.defaultLocale;
  }

  return locale;
}

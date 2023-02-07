import {match} from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {COOKIE_LOCALE_NAME} from '../shared/constants';
import NextIntlMiddlewareConfig from './NextIntlMiddlewareConfig';

export default function resolveLocale(
  i18n: NextIntlMiddlewareConfig,
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
    if (requestCookies.has(COOKIE_LOCALE_NAME)) {
      locale = requestCookies.get(COOKIE_LOCALE_NAME)?.value;
    }
  }

  // Prio 3: Use accept-language header
  if (!locale && requestHeaders) {
    const languages = new Negotiator({
      headers: {
        'accept-language': requestHeaders.get('accept-language') || undefined
      }
    }).languages();
    locale = match(languages, i18n.locales, i18n.defaultLocale);
  }

  // Prio 4: Use default locale
  if (!locale) {
    locale = i18n.defaultLocale;
  }

  return locale;
}

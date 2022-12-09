import acceptLanguageParser from 'accept-language-parser';
import {ReadonlyRequestCookies} from 'next/dist/server/app-render';
import {
  RequestCookies,
  ResponseCookies
} from 'next/dist/server/web/spec-extension/cookies';
import NextI18nConfig from './NextI18nConfig';
import NextIntlCookie from './NextIntlCookie';

export default function resolveLocale(
  i18n: NextI18nConfig,
  requestHeaders?: Headers,
  requestCookies?: ReadonlyRequestCookies | ResponseCookies | RequestCookies,
  pathname?: string
) {
  if (!requestHeaders) requestHeaders = require('next/headers').headers();
  if (!requestCookies) requestCookies = require('next/headers').cookies();

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
    const nextIntlCookie = new NextIntlCookie(requestCookies);

    if (nextIntlCookie.hasLocale()) {
      locale = nextIntlCookie.getLocale();
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

import {match} from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {COOKIE_LOCALE_NAME} from '../shared/constants';
import NextIntlMiddlewareConfig from './NextIntlMiddlewareConfig';

function findLocaleDomain(
  requestHeaders: Headers,
  i18n: NextIntlMiddlewareConfig
) {
  let host =
    requestHeaders.get('x-forwarded-host') ??
    requestHeaders.get('host') ??
    undefined;

  // Remove port
  host = host?.replace(/:\d+$/, '');

  // Consider optional www subdomain
  const domains = i18n.domains?.flatMap((cur) => {
    if (cur.domain.startsWith('www.')) {
      return cur;
    }
    return [cur, {...cur, domain: `www.${cur.domain}`}];
  });

  if (host && domains) {
    const domain = domains.find((cur) => cur.domain === host);
    return domain;
  }

  return undefined;
}

export default function resolveLocale(
  i18n: NextIntlMiddlewareConfig,
  requestHeaders: Headers,
  requestCookies: RequestCookies,
  pathname: string
) {
  let locale, domain;

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

  // Prio 2: Use a domain
  if (!locale && i18n.domains) {
    domain = findLocaleDomain(requestHeaders, i18n);

    if (domain) {
      locale = domain.defaultLocale;
    }
  }

  // Prio 3: Use existing cookie
  if (!locale && requestCookies) {
    if (requestCookies.has(COOKIE_LOCALE_NAME)) {
      locale = requestCookies.get(COOKIE_LOCALE_NAME)?.value;
    }
  }

  // Prio 4: Use the `accept-language` header
  if (!locale && requestHeaders) {
    const languages = new Negotiator({
      headers: {
        'accept-language': requestHeaders.get('accept-language') || undefined
      }
    }).languages();
    try {
      locale = match(languages, i18n.locales, i18n.defaultLocale);
    } catch (e) {
      // Invalid language
    }
  }

  // Prio 5: Use default locale
  if (!locale) {
    locale = i18n.defaultLocale;
  }

  return {locale, domain};
}

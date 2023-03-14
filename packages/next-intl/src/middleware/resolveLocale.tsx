import {match} from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {COOKIE_LOCALE_NAME} from '../shared/constants';
import {
  DomainConfig,
  NextIntlMiddlewareConfigWithDefaults,
  RoutingConfigDomain
} from './NextIntlMiddlewareConfig';
import getHost from './getHost';
import getLocaleFromPathname from './getLocaleFromPathname';

function findLocaleDomain(
  requestHeaders: Headers,
  routingConfig: RoutingConfigDomain
) {
  let host = getHost(requestHeaders);
  // Remove port (easier for local development)
  host = host?.replace(/:\d+$/, '');

  // Consider optional www subdomain
  const domains = routingConfig.domains.flatMap((cur) => {
    if (cur.domain.startsWith('www.')) {
      return cur;
    }
    return [cur, {...cur, domain: `www.${cur.domain}`}];
  });

  if (host && domains) {
    return domains.find((cur) => cur.domain === host);
  }

  return undefined;
}

function resolveLocaleFromPrefix(
  locales: Array<string>,
  defaultLocale: string,
  requestHeaders: Headers,
  requestCookies: RequestCookies,
  pathname: string
) {
  let locale;

  // Prio 1: Use route prefix
  if (pathname) {
    const pathLocale = getLocaleFromPathname(pathname);
    if (locales.includes(pathLocale)) {
      locale = pathLocale;
    }
  }

  // Prio 2: Use existing cookie
  if (!locale && requestCookies) {
    if (requestCookies.has(COOKIE_LOCALE_NAME)) {
      const value = requestCookies.get(COOKIE_LOCALE_NAME)?.value;
      if (value && locales.includes(value)) {
        locale = value;
      }
    }
  }

  // Prio 3: Use the `accept-language` header
  if (!locale && requestHeaders) {
    const languages = new Negotiator({
      headers: {
        'accept-language': requestHeaders.get('accept-language') || undefined
      }
    }).languages();
    try {
      locale = match(languages, locales, defaultLocale);
    } catch (e) {
      // Invalid language
    }
  }

  // Prio 4: Use default locale
  if (!locale) {
    locale = defaultLocale;
  }

  return locale;
}

function resolveLocaleFromDomain(
  routingConfig: RoutingConfigDomain,
  requestHeaders: Headers,
  defaultLocale: string
) {
  let locale, domain;

  // Prio 1: Use a domain
  if (routingConfig.domains) {
    domain = findLocaleDomain(requestHeaders, routingConfig);

    if (domain) {
      locale = domain.locale;
    } else {
      // Might be localhost
    }
  }

  // Prio 2: Use default locale
  if (!locale) {
    locale = defaultLocale;
  }

  return {locale, domain};
}

export default function resolveLocale(
  config: NextIntlMiddlewareConfigWithDefaults,
  requestHeaders: Headers,
  requestCookies: RequestCookies,
  pathname: string
): {locale: string; domain?: DomainConfig} {
  if (config.routing.type === 'domain') {
    return resolveLocaleFromDomain(
      config.routing,
      requestHeaders,
      config.defaultLocale
    );
  } else {
    return {
      locale: resolveLocaleFromPrefix(
        config.locales,
        config.defaultLocale,
        requestHeaders,
        requestCookies,
        pathname
      )
    };
  }
}

import {match} from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {AllLocales, DomainConfig, Pathnames} from '../routing/types';
import {COOKIE_LOCALE_NAME} from '../shared/constants';
import {MiddlewareRoutingConfig} from './config';
import {getHost, getPathnameMatch, isLocaleSupportedOnDomain} from './utils';

function findDomainFromHost<Locales extends AllLocales>(
  requestHeaders: Headers,
  domains: Array<DomainConfig<Locales>>
) {
  let host = getHost(requestHeaders);

  // Remove port (easier for local development)
  host = host?.replace(/:\d+$/, '');

  if (host && domains) {
    return domains.find((cur) => cur.domain === host);
  }

  return undefined;
}

export function getAcceptLanguageLocale<Locales extends AllLocales>(
  requestHeaders: Headers,
  locales: Locales,
  defaultLocale: string
) {
  let locale;

  const languages = new Negotiator({
    headers: {
      'accept-language': requestHeaders.get('accept-language') || undefined
    }
  }).languages();
  try {
    locale = match(
      languages,
      locales as unknown as Array<string>,
      defaultLocale
    );
  } catch (e) {
    // Invalid language
  }

  return locale;
}

function getLocaleFromCookie<Locales extends AllLocales>(
  requestCookies: RequestCookies,
  locales: Locales
) {
  if (requestCookies.has(COOKIE_LOCALE_NAME)) {
    const value = requestCookies.get(COOKIE_LOCALE_NAME)?.value;
    if (value && locales.includes(value)) {
      return value;
    }
  }
}

function resolveLocaleFromPrefix<
  Locales extends AllLocales,
  AppPathnames extends Pathnames<Locales>
>(
  {
    defaultLocale,
    localeDetection,
    localePrefix,
    locales
  }: Pick<
    MiddlewareRoutingConfig<Locales, AppPathnames>,
    'defaultLocale' | 'localeDetection' | 'locales' | 'localePrefix'
  >,
  requestHeaders: Headers,
  requestCookies: RequestCookies,
  pathname: string
) {
  let locale;

  // Prio 1: Use route prefix
  if (pathname) {
    locale = getPathnameMatch(pathname, locales, localePrefix)?.locale;
  }

  // Prio 2: Use existing cookie
  if (!locale && localeDetection && requestCookies) {
    locale = getLocaleFromCookie(requestCookies, locales);
  }

  // Prio 3: Use the `accept-language` header
  if (!locale && localeDetection && requestHeaders) {
    locale = getAcceptLanguageLocale(requestHeaders, locales, defaultLocale);
  }

  // Prio 4: Use default locale
  if (!locale) {
    locale = defaultLocale;
  }

  return locale;
}

function resolveLocaleFromDomain<
  Locales extends AllLocales,
  AppPathnames extends Pathnames<Locales>
>(
  config: MiddlewareRoutingConfig<Locales, AppPathnames>,
  requestHeaders: Headers,
  requestCookies: RequestCookies,
  pathname: string
) {
  const domains = config.domains!;
  const domain = findDomainFromHost(requestHeaders, domains);

  if (!domain) {
    return {
      locale: resolveLocaleFromPrefix(
        config,
        requestHeaders,
        requestCookies,
        pathname
      )
    };
  }

  let locale;

  // Prio 1: Use route prefix
  if (pathname) {
    const prefixLocale = getPathnameMatch(
      pathname,
      config.locales,
      config.localePrefix
    )?.locale;
    if (prefixLocale) {
      if (isLocaleSupportedOnDomain(prefixLocale, domain)) {
        locale = prefixLocale;
      } else {
        // Causes a redirect to a domain that supports the locale
        return {locale: prefixLocale, domain};
      }
    }
  }

  // Prio 2: Use existing cookie
  if (!locale && config.localeDetection && requestCookies) {
    const cookieLocale = getLocaleFromCookie(requestCookies, config.locales);
    if (cookieLocale) {
      if (isLocaleSupportedOnDomain(cookieLocale, domain)) {
        locale = cookieLocale;
      } else {
        // Ignore
      }
    }
  }

  // Prio 3: Use the `accept-language` header
  if (!locale && config.localeDetection && requestHeaders) {
    const headerLocale = getAcceptLanguageLocale(
      requestHeaders,
      domain.locales || config.locales,
      domain.defaultLocale
    );

    if (headerLocale) {
      locale = headerLocale;
    }
  }

  // Prio 4: Use default locale
  if (!locale) {
    locale = domain.defaultLocale;
  }

  return {locale, domain};
}

export default function resolveLocale<
  Locales extends AllLocales,
  AppPathnames extends Pathnames<Locales>
>(
  config: MiddlewareRoutingConfig<Locales, AppPathnames>,
  requestHeaders: Headers,
  requestCookies: RequestCookies,
  pathname: string
): {locale: Locales[number]; domain?: DomainConfig<Locales>} {
  if (config.domains) {
    return resolveLocaleFromDomain(
      config,
      requestHeaders,
      requestCookies,
      pathname
    );
  } else {
    return {
      locale: resolveLocaleFromPrefix(
        config,
        requestHeaders,
        requestCookies,
        pathname
      )
    };
  }
}

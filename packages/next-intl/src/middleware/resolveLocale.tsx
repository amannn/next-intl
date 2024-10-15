import {match} from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {ResolvedRoutingConfig} from '../routing/config';
import {
  Locales,
  Pathnames,
  DomainsConfig,
  DomainConfig,
  LocalePrefixMode
} from '../routing/types';
import {getHost, getPathnameMatch, isLocaleSupportedOnDomain} from './utils';

function findDomainFromHost<AppLocales extends Locales>(
  requestHeaders: Headers,
  domains: DomainsConfig<AppLocales>
) {
  const host = getHost(requestHeaders);

  if (host && domains) {
    return domains.find((cur) => cur.domain === host);
  }

  return undefined;
}

function orderLocales<AppLocales extends Locales>(locales: AppLocales) {
  // Workaround for https://github.com/formatjs/formatjs/issues/4469
  return locales.slice().sort((a, b) => b.length - a.length);
}

export function getAcceptLanguageLocale<AppLocales extends Locales>(
  requestHeaders: Headers,
  locales: AppLocales,
  defaultLocale: string
) {
  let locale;

  const languages = new Negotiator({
    headers: {
      'accept-language': requestHeaders.get('accept-language') || undefined
    }
  }).languages();
  try {
    const orderedLocales = orderLocales(locales);

    locale = match(
      languages,
      orderedLocales as unknown as Array<string>,
      defaultLocale
    );
  } catch (e) {
    // Invalid language
  }

  return locale;
}

function getLocaleFromCookie<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode,
  AppPathnames extends Pathnames<AppLocales> | undefined,
  AppDomains extends DomainsConfig<AppLocales> | undefined
>(
  routing: Pick<
    ResolvedRoutingConfig<
      AppLocales,
      AppLocalePrefixMode,
      AppPathnames,
      AppDomains
    >,
    'localeCookie' | 'locales'
  >,
  requestCookies: RequestCookies
) {
  if (routing.localeCookie && requestCookies.has(routing.localeCookie.name!)) {
    const value = requestCookies.get(routing.localeCookie.name!)?.value;
    if (value && routing.locales.includes(value)) {
      return value;
    }
  }
}

function resolveLocaleFromPrefix<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode,
  AppPathnames extends Pathnames<AppLocales> | undefined,
  AppDomains extends DomainsConfig<AppLocales> | undefined
>(
  routing: Omit<
    ResolvedRoutingConfig<
      AppLocales,
      AppLocalePrefixMode,
      AppPathnames,
      AppDomains
    >,
    'pathnames'
  >,
  requestHeaders: Headers,
  requestCookies: RequestCookies,
  pathname: string
) {
  let locale;

  // Prio 1: Use route prefix
  if (pathname) {
    locale = getPathnameMatch(
      pathname,
      routing.locales,
      routing.localePrefix
    )?.locale;
  }

  // Prio 2: Use existing cookie
  if (!locale && routing.localeDetection && requestCookies) {
    locale = getLocaleFromCookie(routing, requestCookies);
  }

  // Prio 3: Use the `accept-language` header
  if (!locale && routing.localeDetection && requestHeaders) {
    locale = getAcceptLanguageLocale(
      requestHeaders,
      routing.locales,
      routing.defaultLocale
    );
  }

  // Prio 4: Use default locale
  if (!locale) {
    locale = routing.defaultLocale;
  }

  return locale;
}

function resolveLocaleFromDomain<
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode,
  AppPathnames extends Pathnames<AppLocales> | undefined,
  AppDomains extends DomainsConfig<AppLocales> | undefined
>(
  routing: Omit<
    ResolvedRoutingConfig<
      AppLocales,
      AppLocalePrefixMode,
      AppPathnames,
      AppDomains
    >,
    'pathnames'
  >,
  requestHeaders: Headers,
  requestCookies: RequestCookies,
  pathname: string
) {
  const domains = routing.domains!;
  const domain = findDomainFromHost(requestHeaders, domains);

  if (!domain) {
    return {
      locale: resolveLocaleFromPrefix(
        routing,
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
      routing.locales,
      routing.localePrefix
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
  if (!locale && routing.localeDetection && requestCookies) {
    const cookieLocale = getLocaleFromCookie(routing, requestCookies);
    if (cookieLocale) {
      if (isLocaleSupportedOnDomain(cookieLocale, domain)) {
        locale = cookieLocale;
      } else {
        // Ignore
      }
    }
  }

  // Prio 3: Use the `accept-language` header
  if (!locale && routing.localeDetection && requestHeaders) {
    const headerLocale = getAcceptLanguageLocale(
      requestHeaders,
      domain.locales || routing.locales,
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
  AppLocales extends Locales,
  AppLocalePrefixMode extends LocalePrefixMode,
  AppPathnames extends Pathnames<AppLocales> | undefined,
  AppDomains extends DomainsConfig<AppLocales> | undefined
>(
  routing: Omit<
    ResolvedRoutingConfig<
      AppLocales,
      AppLocalePrefixMode,
      AppPathnames,
      AppDomains
    >,
    'pathnames'
  >,
  requestHeaders: Headers,
  requestCookies: RequestCookies,
  pathname: string
): {locale: AppLocales[number]; domain?: DomainConfig<AppLocales>} {
  if (routing.domains) {
    return resolveLocaleFromDomain(
      routing,
      requestHeaders,
      requestCookies,
      pathname
    );
  } else {
    return {
      locale: resolveLocaleFromPrefix(
        routing,
        requestHeaders,
        requestCookies,
        pathname
      )
    };
  }
}

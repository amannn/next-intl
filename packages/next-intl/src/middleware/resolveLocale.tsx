import {match} from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import {RequestCookies} from 'next/dist/server/web/spec-extension/cookies';
import {ResolvedRoutingConfig} from '../routing/config';
import {
  DomainConfig,
  DomainsConfig,
  Locales,
  Pathnames
} from '../routing/types';
import {COOKIE_LOCALE_NAME} from '../shared/constants';
import {ResolvedMiddlewareOptions} from './config';
import {getHost, getPathnameMatch, isLocaleSupportedOnDomain} from './utils';

function findDomainFromHost<AppLocales extends Locales>(
  requestHeaders: Headers,
  domains: DomainsConfig<AppLocales>
) {
  let host = getHost(requestHeaders);

  // Remove port (easier for local development)
  host = host?.replace(/:\d+$/, '');

  if (host) {
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
  } catch {
    // Invalid language
  }

  return locale;
}

function getLocaleFromCookie<AppLocales extends Locales>(
  requestCookies: RequestCookies,
  locales: AppLocales
) {
  if (requestCookies.has(COOKIE_LOCALE_NAME)) {
    const value = requestCookies.get(COOKIE_LOCALE_NAME)?.value;
    if (value && locales.includes(value)) {
      return value;
    }
  }
}

function resolveLocaleFromPrefix<
  AppLocales extends Locales,
  AppPathnames extends Pathnames<AppLocales> = never
>(
  {
    defaultLocale,
    localePrefix,
    locales
  }: ResolvedRoutingConfig<AppLocales, AppPathnames>,
  {localeDetection}: ResolvedMiddlewareOptions,
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
  if (!locale && localeDetection) {
    locale = getLocaleFromCookie(requestCookies, locales);
  }

  // Prio 3: Use the `accept-language` header
  if (!locale && localeDetection) {
    locale = getAcceptLanguageLocale(requestHeaders, locales, defaultLocale);
  }

  // Prio 4: Use default locale
  if (!locale) {
    locale = defaultLocale;
  }

  return locale;
}

function resolveLocaleFromDomain<
  AppLocales extends Locales,
  AppPathnames extends Pathnames<AppLocales> = never
>(
  routing: Omit<ResolvedRoutingConfig<AppLocales, AppPathnames>, 'domains'> &
    Required<Pick<ResolvedRoutingConfig<AppLocales, AppPathnames>, 'domains'>>,
  options: ResolvedMiddlewareOptions,
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
        options,
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
  if (!locale && options.localeDetection) {
    const cookieLocale = getLocaleFromCookie(requestCookies, routing.locales);
    if (cookieLocale) {
      if (isLocaleSupportedOnDomain(cookieLocale, domain)) {
        locale = cookieLocale;
      } else {
        // Ignore
      }
    }
  }

  // Prio 3: Use the `accept-language` header
  if (!locale && options.localeDetection) {
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
  AppPathnames extends Pathnames<AppLocales> = never
>(
  routing: ResolvedRoutingConfig<AppLocales, AppPathnames>,
  options: ResolvedMiddlewareOptions,
  requestHeaders: Headers,
  requestCookies: RequestCookies,
  pathname: string
): {locale: AppLocales[number]; domain?: DomainConfig<AppLocales>} {
  if (routing.domains) {
    const routingWithDomains = routing as Omit<
      ResolvedRoutingConfig<AppLocales, AppPathnames>,
      'domains'
    > &
      Required<
        Pick<ResolvedRoutingConfig<AppLocales, AppPathnames>, 'domains'>
      >;
    return resolveLocaleFromDomain(
      routingWithDomains,
      options,
      requestHeaders,
      requestCookies,
      pathname
    );
  } else {
    return {
      locale: resolveLocaleFromPrefix(
        routing,
        options,
        requestHeaders,
        requestCookies,
        pathname
      )
    };
  }
}

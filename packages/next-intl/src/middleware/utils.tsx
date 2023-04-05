import {DomainConfig} from './NextIntlMiddlewareConfig';

export function getLocaleFromPathname(pathname: string) {
  return pathname.split('/')[1];
}

export function getHost(requestHeaders: Headers) {
  return (
    requestHeaders.get('x-forwarded-host') ??
    requestHeaders.get('host') ??
    undefined
  );
}

export function isLocaleSupportedOnDomain(
  locale: string,
  domain: DomainConfig
) {
  return (
    domain.defaultLocale === locale ||
    !domain.locales ||
    domain.locales.includes(locale)
  );
}

export function getBestMatchingDomain(
  curHostDomain: DomainConfig | undefined,
  locale: string,
  domainConfigs: Array<DomainConfig>
) {
  let domainConfig;

  // Prio 1: Stay on current domain
  if (curHostDomain && isLocaleSupportedOnDomain(locale, curHostDomain)) {
    domainConfig = curHostDomain;
  }

  // Prio 2: Use alternative domain with matching default locale
  if (!domainConfig) {
    domainConfig = domainConfigs.find((cur) => cur.defaultLocale === locale);
  }

  // Prio 3: Use alternative domain with restricted matching locale
  if (!domainConfig) {
    domainConfig = domainConfigs.find(
      (cur) => cur.locales != null && cur.locales.includes(locale)
    );
  }

  // Prio 4: Stay on the current domain if it supports all locales
  if (!domainConfig && curHostDomain?.locales == null) {
    domainConfig = curHostDomain;
  }

  // Prio 5: Use alternative domain that supports all locales
  if (!domainConfig) {
    domainConfig = domainConfigs.find((cur) => !cur.locales);
  }

  return domainConfig;
}

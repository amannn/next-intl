import {UrlObject} from 'url';
import NextLink from 'next/link';
import {ComponentProps} from 'react';

type Href = ComponentProps<typeof NextLink>['href'];

export function isRelativeHref(href: Href) {
  const pathname = typeof href === 'object' ? href.pathname : href;
  return pathname != null && !pathname.startsWith('/');
}

export function isLocalHref(href: Href) {
  if (typeof href === 'object') {
    return href.host == null && href.hostname == null;
  } else {
    const hasProtocol = /^[a-z]+:/i.test(href);
    return !hasProtocol;
  }
}

export function localizeHref(
  href: string,
  locale: string,
  defaultLocale: string,
  pathname: string
): string;
export function localizeHref(
  href: UrlObject | string,
  locale: string,
  defaultLocale: string,
  pathname: string
): UrlObject | string;
export function localizeHref(
  href: UrlObject | string,
  locale: string,
  defaultLocale: string = locale,
  pathname: string
) {
  if (!isLocalHref(href) || isRelativeHref(href)) {
    return href;
  }

  const isSwitchingLocale = locale !== defaultLocale;
  const isPathnamePrefixed =
    locale == null || hasPathnamePrefixed(locale, pathname);
  const shouldPrefix = isPathnamePrefixed || isSwitchingLocale;

  if (shouldPrefix && locale != null) {
    return prefixHref(href, locale);
  }

  return href;
}

export function prefixHref(href: string, locale: string): string;
export function prefixHref(
  href: UrlObject | string,
  locale: string
): UrlObject | string;
export function prefixHref(href: UrlObject | string, locale: string) {
  let prefixedHref;
  if (typeof href === 'string') {
    prefixedHref = localizePathname(locale, href);
  } else {
    prefixedHref = {...href};
    if (href.pathname) {
      prefixedHref.pathname = localizePathname(locale, href.pathname);
    }
  }

  return prefixedHref;
}

export function unlocalizePathname(pathname: string, locale: string) {
  return pathname.replace(new RegExp(`^/${locale}`), '') || '/';
}

export function localizePathname(locale: string, pathname: string) {
  let localizedHref = '/' + locale;

  if (pathname !== '/') {
    localizedHref += pathname;
  }

  return localizedHref;
}

export function hasPathnamePrefixed(locale: string, pathname: string) {
  const prefix = `/${locale}`;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

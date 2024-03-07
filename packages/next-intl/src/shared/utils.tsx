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
  curLocale: string,
  curPathname: string
): string;
export function localizeHref(
  href: UrlObject | string,
  locale: string,
  curLocale: string,
  curPathname: string
): UrlObject | string;
export function localizeHref(
  href: UrlObject | string,
  locale: string,
  curLocale: string = locale,
  curPathname: string
) {
  if (!isLocalHref(href) || isRelativeHref(href)) {
    return href;
  }

  const isSwitchingLocale = locale !== curLocale;
  const isPathnamePrefixed =
    locale == null || hasPathnamePrefixed(locale, curPathname);
  const shouldPrefix = isSwitchingLocale || isPathnamePrefixed;

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
    prefixedHref = prefixPathname(locale, href);
  } else {
    prefixedHref = {...href};
    if (href.pathname) {
      prefixedHref.pathname = prefixPathname(locale, href.pathname);
    }
  }

  return prefixedHref;
}

export function unlocalizePathname(pathname: string, locale: string) {
  return pathname.replace(new RegExp(`^/${locale}`), '') || '/';
}

export function prefixPathname(locale: string, pathname: string) {
  let localizedHref = '/' + locale;

  // Avoid trailing slashes
  if (/^\/(\?.*)?$/.test(pathname)) {
    pathname = pathname.slice(1);
  }

  localizedHref += pathname;

  return localizedHref;
}

export function hasPathnamePrefixed(locale: string, pathname: string) {
  const prefix = `/${locale}`;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function matchesPathname(
  /** E.g. `/users/[userId]-[userName]` */
  template: string,
  /** E.g. `/users/23-jane` */
  pathname: string
) {
  const regex = templateToRegex(template);
  return regex.test(pathname);
}

export function templateToRegex(template: string): RegExp {
  const regexPattern = template
    // Replace optional catchall ('[[...slug]]')
    .replaceAll(/\[\[(\.\.\.[^\]]+)\]\]/g, '?(.*)')
    // Replace catchall ('[...slug]')
    .replaceAll(/\[(\.\.\.[^\]]+)\]/g, '(.+)')
    // Replace regular parameter ('[slug]')
    .replaceAll(/\[([^\]]+)\]/g, '([^/]+)');

  return new RegExp(`^${regexPattern}$`);
}

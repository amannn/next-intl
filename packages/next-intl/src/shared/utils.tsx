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

export function isLocalizableHref(href: Href) {
  return isLocalHref(href) && !isRelativeHref(href);
}

export function localizeHref(
  href: string,
  locale: string,
  curLocale: string,
  curPathname: string,
  prefix: string
): string;
export function localizeHref(
  href: UrlObject | string,
  locale: string,
  curLocale: string,
  curPathname: string,
  prefix: string
): UrlObject | string;
export function localizeHref(
  href: UrlObject | string,
  locale: string,
  curLocale: string = locale,
  curPathname: string,
  prefix: string
) {
  if (!isLocalizableHref(href)) {
    return href;
  }

  const isSwitchingLocale = locale !== curLocale;
  const isPathnamePrefixed = hasPathnamePrefixed(prefix, curPathname);
  const shouldPrefix = isSwitchingLocale || isPathnamePrefixed;

  if (shouldPrefix && prefix != null) {
    return prefixHref(href, prefix);
  }

  return href;
}

export function prefixHref(href: string, prefix: string): string;
export function prefixHref(
  href: UrlObject | string,
  prefix: string
): UrlObject | string;
export function prefixHref(href: UrlObject | string, prefix: string) {
  let prefixedHref;
  if (typeof href === 'string') {
    prefixedHref = prefixPathname(prefix, href);
  } else {
    prefixedHref = {...href};
    if (href.pathname) {
      prefixedHref.pathname = prefixPathname(prefix, href.pathname);
    }
  }

  return prefixedHref;
}

export function unlocalizePathname(pathname: string, locale: string) {
  return pathname.replace(new RegExp(`^/${locale}`), '') || '/';
}

export function prefixPathname(prefix: string, pathname: string) {
  let localizedHref = prefix;

  // Avoid trailing slashes
  if (/^\/(\?.*)?$/.test(pathname)) {
    pathname = pathname.slice(1);
  }

  localizedHref += pathname;

  return localizedHref;
}

export function hasPathnamePrefixed(prefix: string, pathname: string) {
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
    .replace(/\[\[(\.\.\.[^\]]+)\]\]/g, '?(.*)')
    // Replace catchall ('[...slug]')
    .replace(/\[(\.\.\.[^\]]+)\]/g, '(.+)')
    // Replace regular parameter ('[slug]')
    .replace(/\[([^\]]+)\]/g, '([^/]+)');

  return new RegExp(`^${regexPattern}$`);
}

import {UrlObject} from 'url';
import prefixHref from '../shared/prefixHref';
import getCookieLocale from './getCookieLocale';
import hasPathnamePrefixed from './hasPathnamePrefixed';

export default function localizeHref(
  href: string,
  locale?: string,
  pathname?: string
): string;
export default function localizeHref(
  href: UrlObject | string,
  locale?: string,
  pathname?: string
): UrlObject | string;
export default function localizeHref(
  href: UrlObject | string,
  locale?: string,
  pathname?: string
) {
  const cookieLocale =
    typeof window === 'undefined' ? undefined : getCookieLocale();
  if (!locale) locale = cookieLocale;

  if (!pathname) {
    pathname = window.location.pathname;
  }

  const isSwitchingLocale = !cookieLocale || locale !== cookieLocale;
  const isPathnamePrefixed =
    locale == null || hasPathnamePrefixed(locale, pathname);
  const shouldPrefix = isPathnamePrefixed || isSwitchingLocale;

  if (shouldPrefix && locale != null) {
    return prefixHref(href, locale);
  }

  return href;
}

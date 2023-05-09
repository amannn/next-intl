import {UrlObject} from 'url';
import prefixHref from '../shared/prefixHref';
import hasPathnamePrefixed from './hasPathnamePrefixed';

export default function localizeHref(
  href: string,
  locale: string,
  defaultLocale?: string,
  pathname?: string
): string;
export default function localizeHref(
  href: UrlObject | string,
  locale: string,
  defaultLocale?: string,
  pathname?: string
): UrlObject | string;
export default function localizeHref(
  href: UrlObject | string,
  locale: string,
  defaultLocale: string = locale,
  pathname?: string
) {
  if (!pathname) {
    pathname = window.location.pathname;
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

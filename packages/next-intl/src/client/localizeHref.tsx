import {UrlObject} from 'url';
import localizePathname from '../shared/localizePathname';
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

  if ((isPathnamePrefixed || isSwitchingLocale) && locale != null) {
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
  } else {
    return href;
  }
}

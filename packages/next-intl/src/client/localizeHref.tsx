import {UrlObject} from 'url';
import localizePathname from '../shared/localizePathname';
import getCookieLocale from './getCookieLocale';
import hasPathnamePrefixed from './hasPathnamePrefixed';

export default function localizeHref(href: string, locale?: string): string;
export default function localizeHref(
  href: UrlObject | string,
  locale?: string
): UrlObject | string;
export default function localizeHref(
  href: UrlObject | string,
  locale?: string
) {
  const cookieLocale = getCookieLocale();
  if (!locale) locale = cookieLocale;

  const {pathname} = window.location;
  const isSwitchingLocale = locale !== cookieLocale;
  const isPathnamePrefixed = hasPathnamePrefixed(locale, pathname);

  if (isPathnamePrefixed || isSwitchingLocale) {
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

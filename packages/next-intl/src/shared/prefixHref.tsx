import {UrlObject} from 'url';
import localizePathname from './localizePathname';

export default function prefixHref(href: string, locale: string): string;
export default function prefixHref(
  href: UrlObject | string,
  locale: string
): UrlObject | string;
export default function prefixHref(href: UrlObject | string, locale: string) {
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

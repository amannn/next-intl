import Link from 'next/link';
import React, {ComponentProps, forwardRef} from 'react';
import localizeHref from './localizeHref';

type Props = Omit<ComponentProps<typeof Link>, 'locale'> & {
  locale?: string;
};

export default function createLocalizedLinkComponent(useLocale: () => string) {
  /**
   * Wraps `next/link` and prefixes the `href` with the current locale.
   */
  function LocalizedLink({href, locale, ...rest}: Props, ref: Props['ref']) {
    const curLocale = useLocale();
    if (!locale) locale = curLocale;

    let localizedHref;
    if (typeof href === 'string') {
      localizedHref = localizeHref(locale, href);
    } else {
      localizedHref = {...href};
      if (href.pathname) {
        localizedHref.pathname = localizeHref(locale, href.pathname);
      }
    }

    return <Link ref={ref} href={localizedHref} {...rest} />;
  }

  return forwardRef(LocalizedLink);
}

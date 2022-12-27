import Link from 'next/link';
import React, {ComponentProps, forwardRef} from 'react';

type Props = ComponentProps<typeof Link>;

export default function createLocalizedLinkComponent(useLocale: () => string) {
  /**
   * Wraps `next/link` and prefixes the `href` with the current locale.
   */
  function LocalizedLink({href, locale, ...rest}: Props, ref: Props['ref']) {
    const curLocale = useLocale();
    if (!locale) locale = curLocale;

    let localizedHref = '/' + locale;
    if (href !== '/') {
      localizedHref += href;
    }

    return <Link ref={ref} href={localizedHref} {...rest} />;
  }

  return forwardRef(LocalizedLink);
}

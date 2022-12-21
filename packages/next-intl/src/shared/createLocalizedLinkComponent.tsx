import Link from 'next/link';
import React, {ComponentProps, forwardRef} from 'react';

type Props = ComponentProps<typeof Link>;

export default function createLocalizedLinkComponent(useLocale: () => string) {
  /**
   * Wraps `next/link` and prefixes the `href` with the current locale.
   */
  function LocalizedLink({href, ...rest}: Props, ref: Props['ref']) {
    const locale = useLocale();
    const localizedHref = '/' + locale + href;

    return <Link ref={ref} href={localizedHref} {...rest} />;
  }

  return forwardRef(LocalizedLink);
}

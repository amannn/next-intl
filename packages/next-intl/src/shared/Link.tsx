'use client';

import NextLink from 'next/link';
import {usePathname} from 'next/navigation';
import React, {ComponentProps, forwardRef, useEffect, useState} from 'react';
import localizeHref from '../client/localizeHref';

type Props = Omit<ComponentProps<typeof NextLink>, 'locale'> & {
  locale?: string;
};

/**
 * Wraps `next/link` and prefixes the `href` with the current locale.
 */
function Link({href, locale, prefetch, ...rest}: Props, ref: Props['ref']) {
  const [localizedHref, setLocalizedHref] = useState<typeof href>(href);
  const pathname = usePathname();

  // When the user renders a link to another locale, Next.js might prefetch it
  // and the `set-cookie` response header will cause the locale cookie on the
  // current page to be overwritten. Therefore default to disabling prefetching
  // when the user passes a `locale` prop.
  if (prefetch === undefined && locale !== undefined) {
    prefetch = false;
  }

  useEffect(() => {
    setLocalizedHref(localizeHref(href, locale));
  }, [href, locale, pathname]);

  return (
    <NextLink ref={ref} href={localizedHref} prefetch={prefetch} {...rest} />
  );
}

export default forwardRef(Link);

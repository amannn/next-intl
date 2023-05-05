'use client';

import url from 'url';
import NextLink from 'next/link';
import {usePathname} from 'next/navigation';
import React, {ComponentProps, forwardRef, useEffect, useState} from 'react';
import localizeHref from '../client/localizeHref';
import isLocalURL from './isLocalUrl';

type Props = Omit<ComponentProps<typeof NextLink>, 'locale'> & {
  locale?: string;
};

/**
 * Wraps `next/link` and prefixes the `href` with the current locale.
 *
 * Note that when a `locale` prop is passed, two de-optimizations are made:
 *
 * 1. The `prefetch` prop is not supported. This is because Next.js prefetches
 *    the page and the `set-cookie` response header will cause the locale cookie
 *    on the current page to be overwritten.
 * 2. A regular anchor tag is used instead of `next/link`. This is to avoid a
 *    bug with Server Components where the markup wouldn't be updated correctly
 *    otherwise.
 */
function Link({href, locale, prefetch, ...rest}: Props, ref: Props['ref']) {
  const pathname = usePathname();
  const [localizedHref, setLocalizedHref] = useState<typeof href>(() =>
    isLocalURL(href) ? localizeHref(href, locale, pathname) : href
  );

  useEffect(() => {
    // We need to read from the cookie on the client side to know which locale
    // the user currently is on to set the localized href correctly. The state
    // is initialized with a locale prefix, which is always a valid URL, even
    // if it might cause a redirect - this is better than pointing to a
    // non-localized href during the server render.
    if (isLocalURL(href)) {
      setLocalizedHref(localizeHref(href, locale, pathname ?? undefined));
    }
  }, [href, locale, pathname]);

  if (locale !== undefined) {
    // If Next.js fixes the bug where the markup isn't updated correctly when
    // the locale changes, we can remove this check. Note however that we still
    // need to disable prefetching (see comment above).

    if (prefetch && process.env.NODE_ENV !== 'production') {
      console.error(
        'The `prefetch` prop is currently not supported when using the `locale` prop on `Link`.`'
      );
    }

    let localizedHrefString;
    if (localizedHref) {
      if (typeof localizedHref === 'string') {
        localizedHrefString = localizedHref;
      } else {
        localizedHrefString = url.format(localizedHref);
      }
    }

    return (
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <a ref={ref} href={localizedHrefString} {...rest} />
    );
  }

  return (
    <NextLink ref={ref} href={localizedHref} prefetch={prefetch} {...rest} />
  );
}

export default forwardRef(Link);

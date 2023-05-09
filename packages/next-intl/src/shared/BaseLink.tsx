'use client';

import url from 'url';
import NextLink from 'next/link';
import {usePathname} from 'next/navigation';
import React, {ComponentProps, forwardRef, useEffect, useState} from 'react';
import localizeHref from '../client/localizeHref';
import isLocalURL from './isLocalUrl';
import prefixHref from './prefixHref';

type Props = Omit<ComponentProps<typeof NextLink>, 'locale'> & {
  locale?: string;
};

/**
 * Wraps `next/link` and prefixes the `href` with the current locale if necessary.
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
function BaseLink({href, locale, prefetch, ...rest}: Props, ref: Props['ref']) {
  const pathname = usePathname();

  const [localizedHref, setLocalizedHref] = useState<typeof href>(() =>
    isLocalURL(href) && locale
      ? // Potentially the href shouldn't be prefixed, but to determine this we
        // need a) the default locale and b) the information if we use prefixed
        // routing. During the server side render (both in RSC as well as SSR),
        // we don't have this information. Therefore we always prefix the href
        // since this will always result in a valid URL, even if it might cause
        // a redirect. This is better than pointing to a non-localized href
        // during the server render, which would potentially be wrong. The final
        // href is determined in the effect below.
        prefixHref(href, locale)
      : href
  );

  useEffect(() => {
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

export default forwardRef(BaseLink);

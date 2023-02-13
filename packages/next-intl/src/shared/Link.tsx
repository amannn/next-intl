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
function Link({href, locale, ...rest}: Props, ref: Props['ref']) {
  const [localizedHref, setLocalizedHref] = useState<typeof href>(href);
  const pathname = usePathname();

  useEffect(() => {
    setLocalizedHref(localizeHref(href, locale));
  }, [href, locale, pathname]);

  return <NextLink ref={ref} href={localizedHref} {...rest} />;
}

export default forwardRef(Link);

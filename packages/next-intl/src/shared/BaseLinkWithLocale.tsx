'use client';

import NextLink from 'next/link';
import {usePathname} from 'next/navigation';
import React, {ComponentProps, forwardRef, useEffect, useState} from 'react';
import useLocale from '../react-client/useLocale';
import {LocalePrefix} from './types';
import {isLocalHref, localizeHref, prefixHref} from './utils';

type Props = Omit<ComponentProps<typeof NextLink>, 'locale'> & {
  locale: string;
  localePrefix?: LocalePrefix;
};

function BaseLinkWithLocale(
  {href, locale, localePrefix, prefetch, ...rest}: Props,
  ref: Props['ref']
) {
  // The types aren't entirely correct here. Outside of Next.js
  // `useParams` can be called, but the return type is `null`.
  const pathname = usePathname() as ReturnType<typeof usePathname> | null;

  const defaultLocale = useLocale();
  const isChangingLocale = locale !== defaultLocale;

  const [localizedHref, setLocalizedHref] = useState<typeof href>(() =>
    isLocalHref(href) && (localePrefix !== 'never' || isChangingLocale)
      ? // For the `localePrefix: 'as-needed' strategy, the href shouldn't
        // be prefixed if the locale is the default locale. To termine this, we
        // need a) the default locale and b) the information if we use prefixed
        // routing. The default locale can vary by domain, therefore during the
        // RSC as well as the SSR render, we can't determine the default locale
        // statically. Therefore we always prefix the href since this will
        // always result in a valid URL, even if it might cause a redirect. This
        // is better than pointing to a non-localized href during the server
        // render, which would potentially be wrong. The final href is
        // determined in the effect below.
        prefixHref(href, locale)
      : href
  );

  useEffect(() => {
    if (!pathname) return;

    setLocalizedHref(
      localizeHref(href, locale, defaultLocale, pathname ?? undefined)
    );
  }, [defaultLocale, href, locale, pathname]);

  if (isChangingLocale) {
    if (prefetch && process.env.NODE_ENV !== 'production') {
      console.error(
        'The `prefetch` prop is currently not supported when using the `locale` prop on `Link` to switch the locale.`'
      );
    }
    prefetch = false;
  }

  return (
    <NextLink ref={ref} href={localizedHref} prefetch={prefetch} {...rest} />
  );
}

export default forwardRef(BaseLinkWithLocale);

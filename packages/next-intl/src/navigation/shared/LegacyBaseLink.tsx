'use client';

import NextLink from 'next/link';
import {usePathname} from 'next/navigation';
import React, {ComponentProps, forwardRef, useEffect, useState} from 'react';
import useLocale from '../../react-client/useLocale.tsx';
import {InitializedLocaleCookieConfig} from '../../routing/config.tsx';
import {LocalePrefixMode} from '../../routing/types.tsx';
import {
  isLocalizableHref,
  localizeHref,
  prefixHref
} from '../../shared/utils.tsx';
import BaseLink from './BaseLink.tsx';

type Props = Omit<ComponentProps<typeof NextLink>, 'locale'> & {
  locale: string;
  prefix: string;
  localePrefixMode: LocalePrefixMode;
  localeCookie: InitializedLocaleCookieConfig;
};

function LegacyBaseLink(
  {href, locale, localeCookie, localePrefixMode, prefix, ...rest}: Props,
  ref: Props['ref']
) {
  // The types aren't entirely correct here. Outside of Next.js
  // `useParams` can be called, but the return type is `null`.
  const pathname = usePathname() as ReturnType<typeof usePathname> | null;

  const curLocale = useLocale();
  const isChangingLocale = locale !== curLocale;

  const [localizedHref, setLocalizedHref] = useState<typeof href>(() =>
    isLocalizableHref(href) &&
    (localePrefixMode !== 'never' || isChangingLocale)
      ? // For the `localePrefix: 'as-needed' strategy, the href shouldn't
        // be prefixed if the locale is the default locale. To determine this, we
        // need a) the default locale and b) the information if we use prefixed
        // routing. The default locale can vary by domain, therefore during the
        // RSC as well as the SSR render, we can't determine the default locale
        // statically. Therefore we always prefix the href since this will
        // always result in a valid URL, even if it might cause a redirect. This
        // is better than pointing to a non-localized href during the server
        // render, which would potentially be wrong. The final href is
        // determined in the effect below.
        prefixHref(href, prefix)
      : href
  );

  useEffect(() => {
    if (!pathname) return;

    setLocalizedHref(localizeHref(href, locale, curLocale, pathname, prefix));
  }, [curLocale, href, locale, pathname, prefix]);

  return (
    <BaseLink
      ref={ref}
      href={localizedHref}
      locale={locale}
      localeCookie={localeCookie}
      {...rest}
    />
  );
}

const LegacyBaseLinkWithRef = forwardRef(LegacyBaseLink);
(LegacyBaseLinkWithRef as any).displayName = 'ClientLink';
export default LegacyBaseLinkWithRef;

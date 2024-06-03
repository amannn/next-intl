'use client';

import NextLink from 'next/link';
import {usePathname} from 'next/navigation';
import React, {
  ComponentProps,
  MouseEvent,
  ReactElement,
  forwardRef,
  useEffect,
  useState
} from 'react';
import useLocale from '../../react-client/useLocale';
import {LocalePrefixMode} from '../../routing/types';
import {isLocalizableHref, localizeHref, prefixHref} from '../../shared/utils';
import syncLocaleCookie from './syncLocaleCookie';

type Props = Omit<ComponentProps<typeof NextLink>, 'locale'> & {
  locale: string;
  prefix: string;
  localePrefixMode: LocalePrefixMode;
};

function BaseLink(
  {href, locale, localePrefixMode, onClick, prefetch, prefix, ...rest}: Props,
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

  function onLinkClick(event: MouseEvent<HTMLAnchorElement>) {
    syncLocaleCookie(pathname, curLocale, locale);
    if (onClick) onClick(event);
  }

  useEffect(() => {
    if (!pathname) return;

    setLocalizedHref(localizeHref(href, locale, curLocale, pathname, prefix));
  }, [curLocale, href, locale, pathname, prefix]);

  if (isChangingLocale) {
    if (prefetch && process.env.NODE_ENV !== 'production') {
      console.error(
        'The `prefetch` prop is currently not supported when using the `locale` prop on `Link` to switch the locale.`'
      );
    }
    prefetch = false;
  }

  return (
    <NextLink
      ref={ref}
      href={localizedHref}
      hrefLang={isChangingLocale ? locale : undefined}
      onClick={onLinkClick}
      prefetch={prefetch}
      {...rest}
    />
  );
}

const BaseLinkWithRef = forwardRef(BaseLink) as (
  props: Props & {ref?: Props['ref']}
) => ReactElement;
(BaseLinkWithRef as any).displayName = 'ClientLink';
export default BaseLinkWithRef;

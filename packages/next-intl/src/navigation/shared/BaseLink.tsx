'use client';

import NextLink from 'next/link';
import {usePathname} from 'next/navigation';
import React, {
  ComponentProps,
  MouseEvent,
  ReactElement,
  forwardRef,
  useEffect,
  useMemo,
  useState
} from 'react';
import useLocale from '../../react-client/useLocale';
import {AllLocales, LocalePrefix, RoutingLocales} from '../../shared/types';
import {isLocalHref, localizeHref, prefixHref} from '../../shared/utils';
import syncLocaleCookie from './syncLocaleCookie';
import {getLocalePrefix} from './utils';

type Props<Locales extends AllLocales> = Omit<
  ComponentProps<typeof NextLink>,
  'locale'
> & {
  locale: string;
  locales?: RoutingLocales<Locales>;
  localePrefix?: LocalePrefix;
};

function BaseLink<Locales extends AllLocales>(
  {
    href,
    locale,
    localePrefix,
    locales,
    onClick,
    prefetch,
    ...rest
  }: Props<Locales>,
  ref: Props<Locales>['ref']
) {
  const prefix = useMemo(
    () => getLocalePrefix(locale, locales),
    [locale, locales]
  );

  // The types aren't entirely correct here. Outside of Next.js
  // `useParams` can be called, but the return type is `null`.
  const pathname = usePathname() as ReturnType<typeof usePathname> | null;

  const curLocale = useLocale();
  const isChangingLocale = locale !== curLocale;

  const [localizedHref, setLocalizedHref] = useState<typeof href>(() =>
    isLocalHref(href) && (localePrefix !== 'never' || isChangingLocale)
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

const BaseLinkWithRef = forwardRef(BaseLink) as <Locales extends AllLocales>(
  props: Props<Locales> & {ref?: Props<Locales>['ref']}
) => ReactElement;
(BaseLinkWithRef as any).displayName = 'ClientLink';
export default BaseLinkWithRef;

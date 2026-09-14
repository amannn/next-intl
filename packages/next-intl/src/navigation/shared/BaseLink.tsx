'use client';

import NextLink, {type LinkProps} from 'next/link.js';
import {
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
  type Ref,
  forwardRef
} from 'react';
import {type Locale, useLocale} from 'use-intl';
import type {InitializedLocaleCookieConfig} from '../../routing/config.js';
import syncLocaleCookie from './syncLocaleCookie.js';

type NextLinkProps = Omit<ComponentProps<'a'>, keyof LinkProps> &
  Omit<LinkProps, 'locale'>;

type Props = NextLinkProps & {
  locale?: Locale;
  localeCookie: InitializedLocaleCookieConfig;
};

type LocaleChangingLinkProps = NextLinkProps & {
  curLocale: Locale;
  linkRef: Ref<HTMLAnchorElement>;
  locale: Locale;
  localeCookie: InitializedLocaleCookieConfig;
};

// Somehow the types for `next/link` don't work as expected
// when `moduleResolution: "nodenext"` is used.
const Link = NextLink as unknown as (props: NextLinkProps) => ReactNode;

// Links that change the locale are handled in a separate component,
// since they require additional handling for syncing the locale cookie.
function LocaleChangingLink({
  curLocale,
  linkRef,
  locale,
  localeCookie,
  onClick,
  prefetch,
  ...rest
}: LocaleChangingLinkProps) {
  function onLinkClick(event: MouseEvent<HTMLAnchorElement>) {
    // Even though we force a prefix when changing locales,
    // this could be a cache hit of the client-side router,
    // therefore we sync the cookie to ensure it's up to date.
    syncLocaleCookie(localeCookie, curLocale, locale);
    if (onClick) onClick(event);
  }

  if (prefetch && process.env.NODE_ENV !== 'production') {
    console.error(
      'The `prefetch` prop is currently not supported when using the `locale` prop on `Link` to switch the locale.`'
    );
  }

  return (
    <Link
      ref={linkRef}
      hrefLang={locale}
      onClick={onLinkClick}
      prefetch={false}
      {...rest}
    />
  );
}

function BaseLink(
  {locale, localeCookie, ...rest}: Props,
  ref: Ref<HTMLAnchorElement>
) {
  const curLocale = useLocale();
  const isChangingLocale = locale != null && locale !== curLocale;

  if (isChangingLocale) {
    return (
      <LocaleChangingLink
        curLocale={curLocale}
        linkRef={ref}
        locale={locale}
        localeCookie={localeCookie}
        {...rest}
      />
    );
  }

  return <Link ref={ref} {...rest} />;
}

export default forwardRef(BaseLink);

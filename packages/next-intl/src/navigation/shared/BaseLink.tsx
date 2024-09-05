'use client';

import NextLink from 'next/link';
import {usePathname} from 'next/navigation';
import React, {ComponentProps, MouseEvent} from 'react';
import useLocale from '../../react-client/useLocale';
import syncLocaleCookie from './syncLocaleCookie';

type Props = Omit<ComponentProps<typeof NextLink>, 'locale'> & {
  locale?: string;
  nodeRef?: ComponentProps<typeof NextLink>['ref'];
};

function BaseLink({href, locale, nodeRef, onClick, prefetch, ...rest}: Props) {
  // The types aren't entirely correct here. Outside of Next.js
  // `useParams` can be called, but the return type is `null`.
  const pathname = usePathname() as ReturnType<typeof usePathname> | null;

  const curLocale = useLocale();
  const isChangingLocale = locale !== curLocale;

  function onLinkClick(event: MouseEvent<HTMLAnchorElement>) {
    syncLocaleCookie(pathname, curLocale, locale);
    if (onClick) onClick(event);
  }

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
      ref={nodeRef}
      href={href}
      hrefLang={isChangingLocale ? locale : undefined}
      onClick={onLinkClick}
      prefetch={prefetch}
      {...rest}
    />
  );
}

export default BaseLink;

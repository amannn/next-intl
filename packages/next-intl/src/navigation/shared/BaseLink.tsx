'use client';

import NextLink from 'next/link';
import {usePathname} from 'next/navigation';
import React, {ComponentProps, MouseEvent, useEffect, useState} from 'react';
import useLocale from '../../react-client/useLocale';
import syncLocaleCookie from './syncLocaleCookie';

type Props = Omit<ComponentProps<typeof NextLink>, 'locale'> & {
  locale?: string;
  nodeRef?: ComponentProps<typeof NextLink>['ref'];
  unprefixConfig?: {
    domains: {[defaultLocale: string]: string};
    pathname: string;
  };
};

export default function BaseLink({
  href,
  locale,
  nodeRef,
  onClick,
  prefetch,
  unprefixConfig,
  ...rest
}: Props) {
  const curLocale = useLocale();
  const isChangingLocale = locale !== curLocale;
  const linkLocale = locale || curLocale;

  const host = useHost();
  const finalHref =
    unprefixConfig && unprefixConfig.domains[linkLocale] === host
      ? unprefixConfig.pathname
      : href;

  // The types aren't entirely correct here. Outside of Next.js
  // `useParams` can be called, but the return type is `null`.
  const pathname = usePathname() as ReturnType<typeof usePathname> | null;

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
      href={finalHref}
      hrefLang={isChangingLocale ? locale : undefined}
      onClick={onLinkClick}
      prefetch={prefetch}
      {...rest}
    />
  );
}

function useHost() {
  const [host, setHost] = useState<string>();

  useEffect(() => {
    setHost(window.location.host);
  }, []);

  return host;
}

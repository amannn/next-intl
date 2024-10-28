'use client';

import NextLink from 'next/link';
import {usePathname} from 'next/navigation';
import {
  ComponentProps,
  MouseEvent,
  forwardRef,
  useEffect,
  useState
} from 'react';
import useLocale from '../../react-client/useLocale.tsx';
import {InitializedLocaleCookieConfig} from '../../routing/config.tsx';
import syncLocaleCookie from './syncLocaleCookie.tsx';

type Props = Omit<ComponentProps<typeof NextLink>, 'locale'> & {
  locale?: string;
  defaultLocale?: string;
  localeCookie: InitializedLocaleCookieConfig;
  /** Special case for `localePrefix: 'as-needed'` and `domains`. */
  unprefixed?: {
    domains: {[domain: string]: string};
    pathname: string;
  };
};

function BaseLink(
  {
    defaultLocale,
    href,
    locale,
    localeCookie,
    onClick,
    prefetch,
    unprefixed,
    ...rest
  }: Props,
  ref: ComponentProps<typeof NextLink>['ref']
) {
  const curLocale = useLocale();
  const isChangingLocale = locale != null && locale !== curLocale;
  const linkLocale = locale || curLocale;
  const host = useHost();

  const finalHref =
    // Only after hydration (to avoid mismatches)
    host &&
    // If there is an `unprefixed` prop, the
    // `defaultLocale` might differ by domain
    unprefixed &&
    // Unprefix the pathname if a domain matches
    (unprefixed.domains[host] === linkLocale ||
      // … and handle unknown domains by applying the
      // global `defaultLocale` (e.g. on localhost)
      (!Object.keys(unprefixed.domains).includes(host) &&
        curLocale === defaultLocale &&
        !locale))
      ? unprefixed.pathname
      : href;

  // The types aren't entirely correct here. Outside of Next.js
  // `useParams` can be called, but the return type is `null`.
  const pathname = usePathname() as ReturnType<typeof usePathname> | null;

  function onLinkClick(event: MouseEvent<HTMLAnchorElement>) {
    syncLocaleCookie(localeCookie, pathname, curLocale, locale);
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
      ref={ref}
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

export default forwardRef(BaseLink);

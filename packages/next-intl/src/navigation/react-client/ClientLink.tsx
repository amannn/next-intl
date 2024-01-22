import React, {ComponentProps, ReactElement, forwardRef} from 'react';
import useLocale from '../../react-client/useLocale';
import {AllLocales} from '../../shared/types';
import BaseLink from '../shared/BaseLink';

type Props<Locales extends AllLocales> = Omit<
  ComponentProps<typeof BaseLink>,
  'locale'
> & {
  locale?: Locales[number];
};

function ClientLink<Locales extends AllLocales>(
  {locale, ...rest}: Props<Locales>,
  ref: Props<Locales>['ref']
) {
  const defaultLocale = useLocale();
  const linkLocale = locale || defaultLocale;
  return <BaseLink ref={ref} locale={linkLocale} {...rest} />;
}

/**
 * Wraps `next/link` and prefixes the `href` with the current locale if
 * necessary.
 *
 * @example
 * ```tsx
 * import {Link} from 'next-intl';
 *
 * // When the user is on `/en`, the link will point to `/en/about`
 * <Link href="/about">About</Link>
 *
 * // You can override the `locale` to switch to another language
 * <Link href="/" locale="de">Switch to German</Link>
 * ```
 *
 * Note that when a `locale` prop is passed to switch the locale, the `prefetch`
 * prop is not supported. This is because Next.js would prefetch the page and
 * the `set-cookie` response header would cause the locale cookie on the current
 * page to be overwritten before the user even decides to change the locale.
 */
const ClientLinkWithRef = forwardRef(ClientLink) as <
  Locales extends AllLocales
>(
  props: Props<Locales> & {ref?: Props<Locales>['ref']}
) => ReactElement;
(ClientLinkWithRef as any).displayName = 'ClientLink';
export default ClientLinkWithRef;

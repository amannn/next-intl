import React, {ComponentProps, ReactElement, forwardRef} from 'react';
import useClientLocale from '../client/useClientLocale';
import BaseLink from '../shared/BaseLink';
import {AllLocales} from '../shared/types';

type Props<Locales extends AllLocales> = Omit<
  ComponentProps<typeof BaseLink>,
  'locale'
> & {
  locale?: Locales[number];
};

function Link<Locales extends AllLocales>(
  {locale, ...rest}: Props<Locales>,
  ref: Props<Locales>['ref']
) {
  const defaultLocale = useClientLocale();
  return <BaseLink ref={ref} locale={locale || defaultLocale} {...rest} />;
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
const LinkWithRef = forwardRef(Link) as <Locales extends AllLocales>(
  props: Props<Locales> & {ref?: Props<Locales>['ref']}
) => ReactElement;
(LinkWithRef as any).displayName = 'Link';
export default LinkWithRef;

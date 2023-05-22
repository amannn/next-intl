import React, {ComponentProps, forwardRef} from 'react';
import useClientLocale from '../client/useClientLocale';
import BaseLink from '../shared/BaseLink';

type Props = Omit<ComponentProps<typeof BaseLink>, 'locale'> & {
  locale?: string;
};

function Link({locale, ...rest}: Props, ref: Props['ref']) {
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
export default forwardRef(Link);

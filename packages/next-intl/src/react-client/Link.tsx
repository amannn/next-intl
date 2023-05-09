import React, {ComponentProps} from 'react';
import useClientLocale from '../client/useClientLocale';
import BaseLink from '../shared/BaseLink';

type Props = Omit<ComponentProps<typeof BaseLink>, 'locale'> & {
  locale?: string;
};

/**
 * Wraps `next/link` and prefixes the `href` with the current locale if
 * necessary.
 *
 * Note that when a `locale` prop is passed to switch the locale, the `prefetch`
 * prop is not supported. This is because Next.js would prefetch the page and
 * the `set-cookie` response header would cause the locale cookie on the current
 * page to be overwritten before the user even decides to change the locale.
 */
export default function Link({locale, ...rest}: Props) {
  const defaultLocale = useClientLocale();
  return <BaseLink locale={locale || defaultLocale} {...rest} />;
}

'use client';

import React, {ComponentProps} from 'react';
// Workaround for some bundle splitting until we have ESM
import {IntlProvider} from 'use-intl/_IntlProvider';

type Props = Omit<ComponentProps<typeof IntlProvider>, 'locale'> & {
  /** This is automatically received when being rendered from a Server Component. In all other cases, e.g. when rendered from a Client Component, a unit test or with the Pages Router, you can pass this prop explicitly. */
  locale?: string;
};

export default function NextIntlClientProvider({
  children,
  locale,
  now,
  ...rest
}: Props) {
  // TODO: We could call `useParams` here to receive a default value
  // for `locale`, but this would require dropping Next.js <13.

  // TODO: This is no longer necessary, remove for stable release
  if (process.env.NODE_ENV !== 'production' && typeof now === 'string') {
    console.error(
      'Passing an ISO date string to `NextIntlClientProvider` is deprecated since React Server Components have built-in support for serializing dates now. To upgrade, pass a `Date` instance instead.'
    );
    now = new Date(now);
  }

  if (!locale) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? 'Failed to determine locale in `NextIntlClientProvider`, please provide the `locale` prop explicitly.\n\nSee https://next-intl-docs.vercel.app/docs/configuration#locale'
        : undefined
    );
  }

  return (
    <IntlProvider locale={locale} now={now} {...rest}>
      {children}
    </IntlProvider>
  );
}

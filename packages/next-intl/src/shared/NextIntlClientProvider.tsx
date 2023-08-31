'use client';

import {useRouter} from 'next/router';
import React, {ComponentProps} from 'react';
// Workaround for some bundle splitting until we have ESM
import {IntlProvider} from 'use-intl/_IntlProvider';

type Props = Omit<ComponentProps<typeof IntlProvider>, 'locale'> & {
  locale?: string;
};

export default function NextIntlClientProvider({
  children,
  locale,
  now,
  ...rest
}: Props) {
  let router;
  try {
    // Reading from context is practically ok to do conditionally
    // eslint-disable-next-line react-hooks/rules-of-hooks
    router = useRouter();
  } catch (error) {
    // Calling `useRouter` is not supported in the app folder
  }

  // The router can be undefined if used in a context outside
  // of Next.js (e.g. unit tests, Storybook, ...)
  if (!locale && router) {
    locale = router.locale;
  }

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
        ? "Couldn't determine locale. Please pass an explicit `locale` prop the provider, or if you're using the `pages` folder, use internationalized routing (https://nextjs.org/docs/advanced-features/i18n-routing)."
        : undefined
    );
  }

  return (
    <IntlProvider locale={locale} now={now} {...rest}>
      {children}
    </IntlProvider>
  );
}

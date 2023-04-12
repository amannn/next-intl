'use client';

import {useRouter} from 'next/router';
import React, {ComponentProps} from 'react';
import {IntlProvider} from 'use-intl';

type Props = Omit<ComponentProps<typeof IntlProvider>, 'locale' | 'now'> & {
  locale?: string;
  /** If a string is supplied, make sure this conforms to the ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ */
  now?: Date | string;
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

  // Currently RSC serialize dates to strings, therefore make sure we have
  // a date object. We might be able to remove this once more types have
  // first-class serialization support (https://github.com/facebook/react/issues/25687)
  if (typeof now === 'string') {
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

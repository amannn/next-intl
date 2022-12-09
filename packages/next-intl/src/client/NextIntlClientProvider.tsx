'use client';

import {useRouter} from 'next/router';
import React, {ComponentProps} from 'react';
import {IntlProvider} from 'use-intl';

type Props = Omit<ComponentProps<typeof IntlProvider>, 'locale'> & {
  locale?: string;
};

export default function NextIntlProvider({locale, ...rest}: Props) {
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

  if (!locale) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? "Couldn't determine locale. Please pass an explicit `locale` prop the provider, or if you're using the `pages` folder, use internationalized routing (https://nextjs.org/docs/advanced-features/i18n-routing)."
        : undefined
    );
  }

  return <IntlProvider locale={locale} {...rest} />;
}

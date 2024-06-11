'use client';

import React, {ComponentProps} from 'react';
import {IntlProvider} from 'use-intl';

type Props = Omit<ComponentProps<typeof IntlProvider>, 'locale'> & {
  /** This is automatically received when being rendered from a Server Component. In all other cases, e.g. when rendered from a Client Component, a unit test or with the Pages Router, you can pass this prop explicitly. */
  locale?: string;
};

export default function NextIntlClientProvider({locale, ...rest}: Props) {
  // TODO: We could call `useParams` here to receive a default value
  // for `locale`, but this would require dropping Next.js <13.

  if (!locale) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? 'Failed to determine locale in `NextIntlClientProvider`, please provide the `locale` prop explicitly.\n\nSee https://next-intl-docs.vercel.app/docs/configuration#locale'
        : undefined
    );
  }

  return <IntlProvider locale={locale} {...rest} />;
}

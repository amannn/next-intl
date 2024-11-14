'use client';

import {ComponentProps} from 'react';
import {type Locale} from 'use-intl';
import {IntlProvider} from 'use-intl/react';

type Props = Omit<ComponentProps<typeof IntlProvider>, 'locale'> & {
  /** This is automatically received when being rendered from a Server Component. In all other cases, e.g. when rendered from a Client Component, a unit test or with the Pages Router, you can pass this prop explicitly. */
  locale?: Locale;
};

export default function NextIntlClientProvider({locale, ...rest}: Props) {
  if (!locale) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? "Couldn't infer the `locale` prop in `NextIntlClientProvider`, please provide it explicitly.\n\nSee https://next-intl-docs.vercel.app/docs/configuration#locale"
        : undefined
    );
  }

  return <IntlProvider locale={locale} {...rest} />;
}

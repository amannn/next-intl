'use client';

import type {ComponentProps} from 'react';
import type {Locale} from 'use-intl';
import {IntlProvider} from 'use-intl/react';

type IntlProviderProps = Omit<ComponentProps<typeof IntlProvider>, 'locale'>;

type Props = Omit<IntlProviderProps, 'messages'> & {
  /** This is automatically received when being rendered from a Server Component. In all other cases, e.g. when rendered from a Client Component, a unit test or with the Pages Router, you can pass this prop explicitly. */
  locale?: Locale;
  messages?: IntlProviderProps['messages'] | 'infer';
  temp_segment?: string;
};

export default function NextIntlClientProvider({
  locale,
  messages,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  temp_segment: _tempSegment,
  ...rest
}: Props) {
  if (!locale) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? "Couldn't infer the `locale` prop in `NextIntlClientProvider`, please provide it explicitly.\n\nSee https://next-intl.dev/docs/configuration#locale"
        : undefined
    );
  }

  if (process.env.NODE_ENV !== 'production' && messages === 'infer') {
    throw new Error(
      'The `messages="infer"` option can only be resolved in a Server Component.'
    );
  }

  // @ts-expect-error - TODO: fix this
  return <IntlProvider locale={locale} messages={messages} {...rest} />;
}

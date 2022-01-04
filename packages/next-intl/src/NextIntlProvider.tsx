import {useRouter} from 'next/router';
import React, {ComponentProps} from 'react';
import {IntlProvider} from 'use-intl';

type Props = Omit<ComponentProps<typeof IntlProvider>, 'locale'> & {
  locale?: string;
};

export default function NextIntlProvider({locale, ...rest}: Props) {
  // The router can be undefined if used in a context outside
  // of Next.js (e.g. unit tests, Storybook, ...)
  const nextLocale = useRouter()?.locale;

  if (!locale && nextLocale) {
    locale = nextLocale;
  }

  if (!locale) {
    throw new Error(
      __DEV__
        ? "Couldn't determine locale. Please make sure you use internationalized routing or alternatively pass an explicit locale to `NextIntlProvider`."
        : undefined
    );
  }

  return <IntlProvider locale={locale} {...rest} />;
}

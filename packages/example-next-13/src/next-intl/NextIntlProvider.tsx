import {useRouter} from 'next/router';
import React, {ComponentProps} from 'react';
import {IntlProvider} from 'use-intl';

type Props = ComponentProps<typeof IntlProvider>;

export default function NextIntlProvider({locale, ...rest}: Props) {
  let router;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    router = useRouter();
  } catch (error) {
    // Throws that the router was not mounted in the app folder.
  }

  return <IntlProvider locale={router?.locale || locale} {...rest} />;
}

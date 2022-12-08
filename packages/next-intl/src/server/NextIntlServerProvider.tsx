import 'server-only';
import React from 'react';
// eslint-disable-next-line import/default -- False positive
import IntlProviderProps from 'use-intl/dist/src/react/IntlProviderProps';
import getIntlProviderProps from 'use-intl/dist/src/react/getIntlProviderProps';
import NextIntlRequestStorage from './NextIntlRequestStorage';

export default function NextIntlServerProvider(props: IntlProviderProps) {
  // This provider must only be rendered a single time per request.
  if (NextIntlRequestStorage.isInitialized()) {
    console.error(`\`NextIntlServerProvider\` was already initialized.`);
  }

  NextIntlRequestStorage.initRequest(getIntlProviderProps(props));

  return <>{props.children}</>;
}

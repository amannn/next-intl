import 'server-only';
import React from 'react';
// eslint-disable-next-line import/default -- False positive
import IntlProviderProps from 'use-intl/dist/src/react/IntlProviderProps';
import getIntlContextValue from 'use-intl/dist/src/react/getIntlContextValue';
import NextIntlRequestStorage from './NextIntlRequestStorage';

export default function NextIntlServerProvider(props: IntlProviderProps) {
  // Typically this component renders only once in `layout`. It can however be
  // the case that when next-intl features are necessary in the `<head>`, this
  // provider will be used twice.
  //
  // Maybe we're doing us a disfavour by using an API that looks like it's
  // scoped to a part of the tree. The big advantage is that the API is the
  // same for both server and client.
  NextIntlRequestStorage.initRequest(getIntlContextValue(props));

  return <>{props.children}</>;
}

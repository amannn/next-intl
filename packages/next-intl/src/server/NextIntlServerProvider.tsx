import React from 'react';
// eslint-disable-next-line import/default -- False positive
import IntlProviderProps from 'use-intl/dist/src/react/IntlProviderProps';
import NextIntlServerRuntimeContext from './NextIntlServerContext';

export default function NextIntlServerProvider(props: IntlProviderProps) {
  return (
    <NextIntlServerRuntimeContext.Provider
      value={{
        locale: props.locale,
        now: props.now,
        timeZone: props.timeZone
      }}
    >
      {props.children}
    </NextIntlServerRuntimeContext.Provider>
  );
}

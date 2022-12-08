import React from 'react';
import IntlContext from './IntlContext';
import IntlProviderProps from './IntlProviderProps';
import getIntlProviderProps from './getIntlProviderProps';

export default function IntlProvider(props: IntlProviderProps) {
  return <IntlContext.Provider value={getIntlProviderProps(props)} />;
}

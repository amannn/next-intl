import React from 'react';
import IntlContext from './IntlContext';
import IntlProviderProps from './IntlProviderProps';
import getIntlContextValue from './getIntlContextValue';

export default function IntlProvider({children, ...props}: IntlProviderProps) {
  return (
    <IntlContext.Provider value={getIntlContextValue(props)}>
      {children}
    </IntlContext.Provider>
  );
}

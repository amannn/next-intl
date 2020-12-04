import React, {ReactNode} from 'react';
import IntlContext from './IntlContext';
import IntlMessages from './IntlMessages';

type Props = {
  children: ReactNode;
  messages: IntlMessages;
  locale: string;
};

export default function IntlProvider({children, locale, messages}: Props) {
  return (
    <IntlContext.Provider value={{messages, locale}}>
      {children}
    </IntlContext.Provider>
  );
}

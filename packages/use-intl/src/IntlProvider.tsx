import React, {ReactNode} from 'react';
import IntlContext from './IntlContext';
import IntlError from './IntlError';
import IntlMessages from './IntlMessages';

type Props = {
  children: ReactNode;
  locale: string;
  messages: IntlMessages;
  onError?(error: IntlError): void;
};

export default function IntlProvider({
  children,
  locale,
  messages,
  onError = console.error
}: Props) {
  return (
    <IntlContext.Provider value={{messages, locale, onError}}>
      {children}
    </IntlContext.Provider>
  );
}

import {createContext} from 'react';
import IntlError from './IntlError';
import IntlMessages from './IntlMessages';

export type IntlContextShape = {
  messages: IntlMessages;
  locale: string;
  onError(error: IntlError): void;
  getMessageFallback(info: {
    error: IntlError;
    key: string;
    namespace?: string;
  }): string;
};

const IntlContext = createContext<IntlContextShape | undefined>(undefined);

export default IntlContext;

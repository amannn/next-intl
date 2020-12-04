import {createContext} from 'react';
import IntlError from './IntlError';
import IntlMessages from './IntlMessages';

const IntlContext = createContext<
  | {
      messages: IntlMessages;
      locale: string;
      onError(error: IntlError): void;
    }
  | undefined
>(undefined);

export default IntlContext;

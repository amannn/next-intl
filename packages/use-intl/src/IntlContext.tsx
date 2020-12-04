import {createContext} from 'react';
import IntlMessages from './IntlMessages';

const IntlContext = createContext<
  {messages: IntlMessages; locale: string} | undefined
>(undefined);

export default IntlContext;

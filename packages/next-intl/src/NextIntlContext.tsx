import {createContext} from 'react';
import Messages from './NextIntlMessages';

const NextIntlContext = createContext<
  {messages: Messages; locale?: string} | undefined
>(undefined);

export default NextIntlContext;

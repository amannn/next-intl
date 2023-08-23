import {createContext} from 'react';
import {InitializedIntlConfig} from '../core/IntlConfig';
import MessageFormatCache from '../core/MessageFormatCache';

const IntlContext = createContext<
  | (InitializedIntlConfig & {
      messageFormatCache?: MessageFormatCache;
    })
  | undefined
>(undefined);

export default IntlContext;

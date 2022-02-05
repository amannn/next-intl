import {createContext} from 'react';
import {RichTranslationValues} from './TranslationValues';
import Formats from './Formats';
import IntlError from './IntlError';
import IntlMessages from './IntlMessages';

export type IntlContextShape = {
  messages?: IntlMessages;
  locale: string;
  formats?: Partial<Formats>;
  timeZone?: string;
  onError(error: IntlError): void;
  getMessageFallback(info: {
    error: IntlError;
    key: string;
    namespace?: string;
  }): string;
  now?: Date;
  defaultRichTextElements?: RichTranslationValues
};

const IntlContext = createContext<IntlContextShape | undefined>(undefined);

export default IntlContext;

import {createContext} from 'react';
import Formats from './Formats';
import IntlError from './IntlError';
import IntlMessages from './IntlMessages';
import {RichTranslationValues} from './TranslationValues';

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
  defaultTranslationValues?: RichTranslationValues;
};

const IntlContext = createContext<IntlContextShape | undefined>(undefined);

export default IntlContext;

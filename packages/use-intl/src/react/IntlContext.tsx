import {createContext} from 'react';
import AbstractIntlMessages from '../core/AbstractIntlMessages';
import Formats from '../core/Formats';
import IntlError from '../core/IntlError';
import {RichTranslationValues} from '../core/TranslationValues';

export type IntlContextShape = {
  messages?: AbstractIntlMessages;
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

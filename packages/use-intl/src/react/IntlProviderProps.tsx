import {ReactNode} from 'react';
import {AbstractIntlMessages} from '../core';
import IntlConfiguration from '../core/IntlConfiguration';
import {RichTranslationValues} from '../core/TranslationValues';

type IntlProviderProps = IntlConfiguration & {
  /** All components that use the provided hooks should be within this tree. */
  children: ReactNode;
  /** Global default values for translation values and rich text elements.
   * Can be used for consistent usage or styling of rich text elements.
   * Defaults will be overidden by locally provided values. */
  defaultTranslationValues?: RichTranslationValues;
  /** All messages that will be available in your components. */
  messages?: AbstractIntlMessages;
};

export default IntlProviderProps;

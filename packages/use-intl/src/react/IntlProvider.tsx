import React, {ReactNode, useEffect} from 'react';
import {AbstractIntlMessages} from '../core';
import IntlConfiguration from '../core/IntlConfiguration';
import {RichTranslationValues} from '../core/TranslationValues';
import {defaultGetMessageFallback, defaultOnError} from '../core/defaults';
import validateMessages from '../core/validateMessages';
import IntlContext from './IntlContext';

type Props = IntlConfiguration & {
  /** All components that use the provided hooks should be within this tree. */
  children: ReactNode;
  /** Global default values for translation values and rich text elements.
   * Can be used for consistent usage or styling of rich text elements.
   * Defaults will be overidden by locally provided values. */
  defaultTranslationValues?: RichTranslationValues;
  /** All messages that will be available in your components. */
  messages?: AbstractIntlMessages;
};

export default function IntlProvider({
  children,
  onError = defaultOnError,
  getMessageFallback = defaultGetMessageFallback,
  messages,
  ...contextValues
}: Props) {
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (messages) {
        validateMessages(messages, onError);
      }
    }, [messages, onError]);
  }

  return (
    <IntlContext.Provider
      value={{...contextValues, messages, onError, getMessageFallback}}
    >
      {children}
    </IntlContext.Provider>
  );
}

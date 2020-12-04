import React, {ReactNode} from 'react';
import IntlContext from './IntlContext';
import IntlMessages from './IntlMessages';
import {IntlError} from '.';

type Props = {
  /** All messages that will be available in your components. */
  messages: IntlMessages;
  /** A valid Unicode locale tag (e.g. "en" or "en-GB"). */
  locale: string;
  /** This callback will be invoked when an error is encountered during
   * resolving a message or formatting it. This defaults to `console.error` to
   * keep your app running. You can customize the handling by taking
   * `error.code` into account. */
  onError?(error: IntlError): void;
  /** Will be called when a message couldn't be resolved or formatting it led to
   * an error. This defaults to `${namespace}.${key}` You can use this to
   * customize what will be rendered in this case. */
  getMessageFallback?(info: {
    namespace?: string;
    key: string;
    error: IntlError;
  }): string;
  /** All components that use the provided hooks should be within this tree. */
  children: ReactNode;
};

function defaultGetMessageFallback({
  key,
  namespace
}: {
  key: string;
  namespace?: string;
}) {
  return [namespace, key].filter((part) => part != null).join('.');
}

export default function IntlProvider({
  children,
  onError = console.error,
  getMessageFallback = defaultGetMessageFallback,
  ...contextValues
}: Props) {
  return (
    <IntlContext.Provider
      value={{...contextValues, onError, getMessageFallback}}
    >
      {children}
    </IntlContext.Provider>
  );
}

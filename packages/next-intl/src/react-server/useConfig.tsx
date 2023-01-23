import {cache, use, useMemo} from 'react';
import getIntlContextValue from 'use-intl/dist/src/react/getIntlContextValue';
import staticConfig from '../server/staticConfig';
import useLocale from './useLocale';

const receiveMessages = cache(
  (locale: string, getMessages: typeof staticConfig['getMessages']) =>
    getMessages?.({locale})
);

function isPromise(value: any): value is Promise<unknown> {
  return value != null && typeof value.then === 'function';
}

export default function useConfig() {
  const locale = useLocale();

  return useMemo(() => {
    function getStaticConfig() {
      const {getMessages, ...rest} = staticConfig;
      const messagesOrPromise = receiveMessages(locale, getMessages);

      // Only promises can be unwrapped
      const messages = isPromise(messagesOrPromise)
        ? use(messagesOrPromise)
        : messagesOrPromise;

      return {messages, ...rest};
    }

    const opts = {...getStaticConfig(), locale};
    return getIntlContextValue(opts);
  }, [locale]);
}

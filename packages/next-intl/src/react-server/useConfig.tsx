import {cache, use, useMemo} from 'react';
import getIntlContextValue from 'use-intl/dist/src/react/getIntlContextValue';
import staticConfig from '../server/staticConfig';
import useLocale from './useLocale';

const receiveMessages = cache(
  (locale: string, getMessages: typeof staticConfig['getMessages']) =>
    getMessages?.({locale})
);

// Make sure `now` is consistent across the request in case none was configured
const receiveNow = cache((now?: Date) => now || new Date());

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

    const {now: receivedNow, ...rest} = getStaticConfig();
    const now = receiveNow(receivedNow);
    const opts = {...rest, now, locale};

    return getIntlContextValue(opts);
  }, [locale]);
}

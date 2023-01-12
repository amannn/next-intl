import {use, useMemo} from 'react';
import getIntlContextValue from 'use-intl/dist/src/react/getIntlContextValue';
import staticConfig from '../server/staticConfig';
import useLocale from './useLocale';

function isPromise(value: any): value is Promise<unknown> {
  return value != null && typeof value.then === 'function';
}

export default function useConfig() {
  const locale = useLocale();

  return useMemo(() => {
    function getStaticConfig() {
      const {getMessages, ...rest} = staticConfig;
      const messagesOrPromise = getMessages?.({locale});

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

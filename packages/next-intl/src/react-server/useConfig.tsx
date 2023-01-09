import {use} from 'react';
import getIntlContextValue from 'use-intl/dist/src/react/getIntlContextValue';
import staticConfig from '../server/staticConfig';
import useRuntimeConfig from './useRuntimeConfig';

function isPromise(value: any): value is Promise<unknown> {
  return value != null && typeof value.then === 'function';
}

export default function useConfig() {
  const {locale, now, timeZone} = useRuntimeConfig();

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
  if (now != null) opts.now = now;
  if (timeZone != null) opts.timeZone = timeZone;

  return getIntlContextValue(opts);
}

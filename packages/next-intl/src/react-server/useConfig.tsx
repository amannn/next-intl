import {use} from 'react';
import getIntlContextValue from 'use-intl/dist/src/react/getIntlContextValue';
import {useServerRuntimeConfig} from '../server/NextIntlServerRuntimeContext';
import staticConfig from '../server/staticConfig';

function isPromise(value: any): value is Promise<unknown> {
  return value != null && typeof value.then === 'function';
}

export default function useConfig() {
  const providerConfig = useServerRuntimeConfig();

  function getStaticConfig() {
    const {getMessages, ...rest} = staticConfig;
    const messagesOrPromise = getMessages?.(providerConfig);

    // Only promises can be unwrapped
    const messages = isPromise(messagesOrPromise)
      ? use(messagesOrPromise)
      : messagesOrPromise;

    return {messages, ...rest};
  }

  return getIntlContextValue({...getStaticConfig(), ...providerConfig});
}

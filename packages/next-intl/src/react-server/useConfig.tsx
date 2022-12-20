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
    const valueOrPromise = staticConfig.getOptions?.(providerConfig);

    // Only promises can be unwrapped
    return isPromise(valueOrPromise) ? use(valueOrPromise) : valueOrPromise;
  }

  return getIntlContextValue({...getStaticConfig(), ...providerConfig});
}

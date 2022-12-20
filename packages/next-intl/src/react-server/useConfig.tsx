// @ts-expect-error Should we provide a default? Probably.
import staticConfig from 'next-intl/config';
import {use} from 'react';
import getIntlContextValue from 'use-intl/dist/src/react/getIntlContextValue';
import {NextIntlStaticOptions} from '../server/NextI18nConfig';
import {useServerRuntimeConfig} from '../server/NextIntlServerRuntimeContext';

export default function useConfig() {
  const providerConfig = useServerRuntimeConfig();

  function getStaticConfig() {
    const valueOrPromise = staticConfig.getOptions?.(providerConfig);
    const isPromise =
      valueOrPromise != null && typeof valueOrPromise.then === 'function';

    // Only promises can be unwrapped
    return (
      isPromise ? use(valueOrPromise) : valueOrPromise
    ) as NextIntlStaticOptions;
  }

  return getIntlContextValue({...getStaticConfig(), ...providerConfig});
}

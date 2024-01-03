import {cache} from 'react';
import {initializeConfig} from 'use-intl/core';
import {ServerIntlConfig} from '../../shared/types';
import createRequestConfig from './createRequestConfig';

// Make sure `now` is consistent across the request in case none was configured
function getDefaultNowImpl() {
  return new Date();
}
const getDefaultNow = cache(getDefaultNowImpl);

// This is automatically inherited by `NextIntlClientProvider` if
// the component is rendered from a Server Component
function getDefaultTimeZoneImpl() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
const getDefaultTimeZone = cache(getDefaultTimeZoneImpl);

async function receiveRuntimeConfigImpl(
  locale: string,
  getConfig?: typeof createRequestConfig
) {
  let result = getConfig?.({locale});
  if (result instanceof Promise) {
    result = await result;
  }
  return {
    ...result,
    now: result?.now || getDefaultNow(),
    timeZone: result?.timeZone || getDefaultTimeZone()
  };
}
const receiveRuntimeConfig = cache(receiveRuntimeConfigImpl);

async function getConfigImpl(locale: string): Promise<ServerIntlConfig> {
  const runtimeConfig = await receiveRuntimeConfig(locale, createRequestConfig);
  const opts = {...runtimeConfig, locale};
  return initializeConfig(opts);
}
const getConfig = cache(getConfigImpl);
export default getConfig;

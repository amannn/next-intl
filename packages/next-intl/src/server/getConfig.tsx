import {cache} from 'react';
import {initializeConfig} from 'use-intl/core';
import createRequestConfig from '../server/createRequestConfig';

// Make sure `now` is consistent across the request in case none was configured
const getDefaultNow = cache(() => new Date());

const receiveRuntimeConfig = cache(
  async (locale: string, getConfig?: typeof createRequestConfig) => {
    let result = getConfig?.({locale});
    if (result instanceof Promise) {
      result = await result;
    }
    return {
      ...result,
      now: result?.now || getDefaultNow()
    };
  }
);

const getConfig = cache(async (locale: string) => {
  const runtimeConfig = await receiveRuntimeConfig(locale, createRequestConfig);
  const opts = {...runtimeConfig, locale};
  return initializeConfig(opts);
});

export default getConfig;

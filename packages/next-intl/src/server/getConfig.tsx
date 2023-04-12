import {cache} from 'react';
import getInitializedConfig from 'use-intl/dist/src/react/getInitializedConfig';
import createRequestConfig from '../server/createRequestConfig';
import getLocale from './getLocale';

const receiveRuntimeConfig = cache(
  async (locale: string, getConfig?: typeof createRequestConfig) => {
    let result = getConfig?.({locale});
    if (result instanceof Promise) {
      result = await result;
    }
    return {
      ...result,
      // Make sure `now` is consistent across the request in case none was configured
      now: result?.now || new Date()
    };
  }
);

const getConfig = cache(async () => {
  const locale = getLocale();
  const runtimeConfig = await receiveRuntimeConfig(locale, createRequestConfig);
  const opts = {...runtimeConfig, locale};
  return getInitializedConfig(opts);
});

export default getConfig;

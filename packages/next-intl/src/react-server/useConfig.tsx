import {cache, use, useMemo} from 'react';
import getIntlContextValue from 'use-intl/dist/src/react/getIntlContextValue';
import createRequestConfig from '../server/createRequestConfig';
import useLocale from './useLocale';

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

function isPromise(value: any): value is Promise<unknown> {
  return value != null && typeof value.then === 'function';
}

export default function useConfig() {
  const locale = useLocale();

  function safeUnwrap<Value>(valueOrPromise: Value | Promise<Value>): Value {
    return isPromise(valueOrPromise) ? use(valueOrPromise) : valueOrPromise;
  }

  return useMemo(() => {
    const runtimeConfig = safeUnwrap(
      receiveRuntimeConfig(locale, createRequestConfig)
    );
    const opts = {...runtimeConfig, locale};
    return getIntlContextValue(opts);
  }, [locale]);
}

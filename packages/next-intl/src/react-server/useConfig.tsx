import {cache, use, useMemo} from 'react';
import getIntlContextValue from 'use-intl/dist/src/react/getIntlContextValue';
import {GetNextIntlRuntimeConfig} from '../server/NextIntlConfig';
import NextIntlServerConfig, {
  getRuntimeConfig
} from '../server/NextIntlServerConfig';
import useLocale from './useLocale';

// Make sure `now` is consistent across the request in case none was configured
const receiveNow = cache((now?: Date) => now || new Date());

const receiveRuntimeConfig = cache(
  async (locale: string, getConfig?: GetNextIntlRuntimeConfig) => {
    let result = getConfig?.({locale});
    if (result instanceof Promise) {
      result = await result;
    }
    return result;
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
    const runtimeConfig = use(receiveRuntimeConfig(locale, getRuntimeConfig));

    let messages;
    if ('getMessages' in NextIntlServerConfig) {
      messages = safeUnwrap(NextIntlServerConfig.getMessages?.({locale}));
      console.warn(
        `\n\nDEPRECATION WARNING: The \`getMessages()\` function is deprecated and will be removed in the stable release of next-intl. Please see the updated documentation: https://next-intl-docs.vercel.app/docs/next-13/server-components\n\n`
      );
    } else {
      messages = runtimeConfig?.messages;
    }

    const now = receiveNow(
      'now' in NextIntlServerConfig
        ? NextIntlServerConfig.now
        : runtimeConfig?.now
    );

    const opts = {
      ...NextIntlServerConfig,
      ...runtimeConfig,
      now,
      messages,
      locale
    };
    return getIntlContextValue(opts);
  }, [locale]);
}

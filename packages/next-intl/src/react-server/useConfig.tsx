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

  try {
    return useMemo(() => {
      const runtimeConfig = safeUnwrap(
        receiveRuntimeConfig(locale, createRequestConfig)
      );
      const opts = {...runtimeConfig, locale};
      return getIntlContextValue(opts);
    }, [locale]);
  } catch (error) {
    if (
      error instanceof TypeError &&
      error.message.includes("reading 'useMemo'")
    ) {
      throw new Error(
        `\`next-intl\` is currently not supported in async components. Please turn your component into a regular component by removing the \`async\` keyword and replacing \`await\` with \`use\` in the component body.

Before:

async function Component() {
  const response = await fetch(...);
  // ...
}

After:

function Component() {
  const response = use(fetch(...)));
  // ...
}

Alternatively, you can split your component to separate the async code from the usage of \`next-intl\`.

See https://github.com/vercel/next.js/issues/44778
`
      );
    } else {
      throw error;
    }
  }
}

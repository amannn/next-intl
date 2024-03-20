// @ts-ignore -- Only available after build
import {_getConfig as getConfig} from 'next-intl/server';
import {use} from 'react';
import useLocale from './useLocale';

function useHook<Value>(hookName: string, promise: Promise<Value>) {
  try {
    return use(promise);
  } catch (error: any) {
    if (
      error instanceof TypeError &&
      error.message.includes("Cannot read properties of null (reading 'use')")
    ) {
      throw new Error(
        `\`${hookName}\` is not callable within an async component. Please refer to https://next-intl-docs.vercel.app/docs/environments/server-client-components#async-components`,
        {cause: error}
      );
    } else {
      throw error;
    }
  }
}

export default function useConfig(
  hookName: string
): Awaited<ReturnType<typeof getConfig>> {
  const locale = useLocale();
  return useHook(hookName, getConfig(locale));
}

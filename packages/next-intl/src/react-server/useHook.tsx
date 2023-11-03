import {use} from 'react';

export default function useHook<Value>(
  hookName: string,
  promise: Promise<Value>
) {
  try {
    return use(promise);
  } catch (error: any) {
    if (
      error instanceof TypeError &&
      error.message.includes("Cannot read properties of null (reading 'use')")
    ) {
      throw new Error(
        `\`${hookName}\` is not callable within an async component. Please refer to https://next-intl-docs-git-feat-next-13-rsc-next-intl.vercel.app/docs/environments/server-client-components#async-components`,
        {cause: error}
      );
    } else {
      throw error;
    }
  }
}

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
        `\`${hookName}\` is not callable within an async component.

You can either:

1. Split your component into two, leaving the async code in the first
   one and moving the usage of \`${hookName}\` to the second one.

2. Use an awaitable version of the hook, see
   https://next-intl-docs.vercel.app/docs/next-13/server-components#using-internationalization-outside-of-components`,
        {cause: error}
      );
    } else {
      throw error;
    }
  }
}

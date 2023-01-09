import {headers} from 'next/headers';
import NextIntlServerRuntime from '../server/NextIntlServerRuntime';
import {HEADER_CONFIG_NAME} from '../shared/constants';

export default function useRuntimeConfig() {
  const value = headers().get(HEADER_CONFIG_NAME);
  if (!value) {
    throw new Error(
      'Unable to find `next-intl` runtime config, have you configured the middleware?`'
    );
  }
  return NextIntlServerRuntime.deserialize(value);
}

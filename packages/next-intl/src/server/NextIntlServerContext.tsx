// @ts-expect-error `cSC` is not officially released yet
import {createServerContext, useContext} from 'react';
import IntlProviderProps from 'use-intl/dist/react/IntlProviderProps';

export type NextIntlRuntimeConfig = Pick<
  IntlProviderProps,
  'locale' | 'now' | 'timeZone'
>;

export type NextIntlStaticConfig = Pick<
  IntlProviderProps,
  | 'defaultTranslationValues'
  | 'messages'
  | 'formats'
  | 'onError'
  | 'getMessageFallback'
>;

const NextIntlServerRuntimeContext = createServerContext<NextIntlRuntimeConfig>(
  'next-intl',
  undefined
);

export function useServerRuntimeConfig() {
  const baseConfig = useContext(
    NextIntlServerRuntimeContext
  ) as NextIntlRuntimeConfig;

  // TODO: Validate or error message

  return baseConfig;
}

export default NextIntlServerRuntimeContext;

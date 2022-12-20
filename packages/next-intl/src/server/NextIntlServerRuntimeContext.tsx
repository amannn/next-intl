// @ts-expect-error `cSC` is not officially released yet
import React, {createServerContext, useContext} from 'react';
import IntlProviderProps from 'use-intl/dist/react/IntlProviderProps';
import {NextIntlRuntimeConfig} from './NextIntlConfig';

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

export function NextIntlServerProvider(props: IntlProviderProps) {
  return (
    <NextIntlServerRuntimeContext.Provider
      value={{
        locale: props.locale,
        now: props.now,
        timeZone: props.timeZone
      }}
    >
      {props.children}
    </NextIntlServerRuntimeContext.Provider>
  );
}

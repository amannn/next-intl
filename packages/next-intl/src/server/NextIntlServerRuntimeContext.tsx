// @ts-expect-error `cSC` is not officially released yet
import React, {createServerContext, use} from 'react';
import IntlProviderProps from 'use-intl/dist/react/IntlProviderProps';
import {NextIntlRuntimeConfig} from './NextIntlConfig';
import SyncLocaleCookie from './SyncLocaleCookie';

const NextIntlServerRuntimeContext = createServerContext<NextIntlRuntimeConfig>(
  'next-intl',
  undefined
);

export function useServerRuntimeConfig() {
  let value: NextIntlRuntimeConfig;
  try {
    value = use(NextIntlServerRuntimeContext) as NextIntlRuntimeConfig;
  } catch (error) {
    throw new Error(
      "Currently all hooks from next-intl (like `useTranslations`) can only be used in Server Components that are not marked with `async`. We're working on removing this limitation.\n\nFor now, you can work around this by removing the `async` keyword and instead using the `use` hook from React to unwrap async values. See https://beta.nextjs.org/docs/data-fetching/fetching#use-in-client-components"
    );
  }

  if (!value) {
    throw new Error(
      'No intl context found. Have you configured `NextIntlServerProvider`?'
    );
  }

  return value;
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
      <SyncLocaleCookie locale={props.locale} />
    </NextIntlServerRuntimeContext.Provider>
  );
}

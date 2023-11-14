import {headers} from 'next/headers';
import {cache} from 'react';
import {HEADER_LOCALE_NAME} from '../shared/constants';

const getLocaleFromHeader = cache(() => {
  let locale;

  try {
    locale = headers().get(HEADER_LOCALE_NAME);
  } catch (error) {
    if (
      error instanceof Error &&
      (error as any).digest === 'DYNAMIC_SERVER_USAGE'
    ) {
      throw new Error(
        'Usage of next-intl APIs in Server Components currently opts into dynamic rendering. This limitation will eventually be lifted, but as a stopgap solution, you can use the `unstable_setRequestLocale` API to enable static rendering, see https://next-intl-docs.vercel.app/docs/getting-started/app-router-server-components#static-rendering',
        {cause: error}
      );
    } else {
      throw error;
    }
  }

  if (!locale) {
    throw new Error(
      `Unable to find \`next-intl\` locale because the middleware didn't run on this request. See https://next-intl-docs.vercel.app/docs/routing/middleware#unable-to-find-locale`
    );
  }

  return locale;
});

// Workaround until `createServerContext` is available
const getCache = cache(() => {
  const value: {locale?: string} = {locale: undefined};
  return value;
});

export function setRequestLocale(locale: string) {
  getCache().locale = locale;
}

export function getRequestLocale(): string {
  return getCache().locale || getLocaleFromHeader();
}

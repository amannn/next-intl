import {headers} from 'next/headers';
import {cache} from 'react';
import {HEADER_LOCALE_NAME} from '../shared/constants';

const getLocaleFromHeader = cache(() => {
  let locale;

  try {
    locale = headers().get(HEADER_LOCALE_NAME);
  } catch (error) {
    if (
      process.env.NODE_ENV !== 'production' &&
      error instanceof Error &&
      (error as any).digest === 'DYNAMIC_SERVER_USAGE'
    ) {
      throw new Error(
        'Usage of next-intl APIs in Server Components is currently only available for dynamic rendering (i.e. no `generateStaticParams`).\n\nSupport for static rendering is under consideration, please refer to the roadmap: https://next-intl-docs.vercel.app/docs/getting-started/app-router-server-components#roadmap',
        {cause: error}
      );
    } else {
      throw error;
    }
  }

  if (!locale) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? 'Unable to find `next-intl` locale, have you configured the middleware?`'
        : undefined
    );
  }

  return locale;
});

// Workaround until `createServerContext` is available
const getCache = cache(() => {
  const value: {locale?: string} = {locale: undefined};
  return value;
});

export function setRequestCacheLocale(locale: string) {
  getCache().locale = locale;
}

export function getRequestLocale(): string {
  return getCache().locale || getLocaleFromHeader();
}

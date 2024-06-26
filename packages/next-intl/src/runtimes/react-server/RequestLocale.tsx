import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import {cache} from 'react';
import {HEADER_LOCALE_NAME} from '../../shared/constants';

function getLocaleFromHeaderImpl() {
  let locale;

  try {
    locale = headers().get(HEADER_LOCALE_NAME);
  } catch (error) {
    if (
      error instanceof Error &&
      (error as any).digest === 'DYNAMIC_SERVER_USAGE'
    ) {
      throw new Error(
        'Usage of next-intl APIs in Server Components currently opts into dynamic rendering. This limitation will eventually be lifted, but as a stopgap solution, you can use the `unstable_setRequestLocale` API to enable static rendering, see https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing#static-rendering',
        {cause: error}
      );
    } else {
      throw error;
    }
  }

  if (!locale) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `\nUnable to find \`next-intl\` locale because the middleware didn't run on this request. See https://next-intl-docs.vercel.app/docs/routing/middleware#unable-to-find-locale. The \`notFound()\` function will be called as a result.\n`
      );
    }
    notFound();
  }

  return locale;
}
const getLocaleFromHeader = cache(getLocaleFromHeaderImpl);

// https://github.com/vercel/next.js/discussions/58862
function getCacheImpl() {
  const value: {locale?: string} = {locale: undefined};
  return value;
}
const getCache = cache(getCacheImpl);

export function setRequestLocale(locale: string) {
  getCache().locale = locale;
}

export function getRequestLocale(): string {
  return getCache().locale || getLocaleFromHeader();
}

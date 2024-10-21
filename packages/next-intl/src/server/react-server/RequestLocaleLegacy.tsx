import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import {cache} from 'react';
import {HEADER_LOCALE_NAME} from '../../shared/constants';
import {getCachedRequestLocale} from './RequestLocaleCache';

// This was originally built for Next.js <14, where `headers()` was not async.
// With https://github.com/vercel/next.js/pull/68812, the API became async.
// This file can be removed once we remove the legacy navigation APIs.
function getHeaders() {
  return headers();
}

function getLocaleFromHeaderImpl() {
  let locale;

  try {
    locale = getHeaders().get(HEADER_LOCALE_NAME);
  } catch (error) {
    if (
      error instanceof Error &&
      (error as any).digest === 'DYNAMIC_SERVER_USAGE'
    ) {
      throw new Error(
        'Usage of next-intl APIs in Server Components currently opts into dynamic rendering. This limitation will eventually be lifted, but as a stopgap solution, you can use the `setRequestLocale` API to enable static rendering, see https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing#static-rendering',
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

export function getRequestLocale(): string {
  return getCachedRequestLocale() || getLocaleFromHeader();
}

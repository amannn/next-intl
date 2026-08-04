import {cache} from 'react';
import type {Locale} from 'use-intl';

// See https://github.com/vercel/next.js/discussions/58862
function getCacheImpl() {
  const value: {locale?: Locale} = {locale: undefined};
  return value;
}

const getCache = cache(getCacheImpl);

export function getCachedRequestLocale() {
  return getCache().locale;
}

/**
 * @deprecated Please migrate to [`next/root-params`](https://next-intl.dev/blog/nextjs-root-params).
 */
export function setCachedRequestLocale(locale: Locale) {
  getCache().locale = locale;
}

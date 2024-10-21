import {cache} from 'react';

// See https://github.com/vercel/next.js/discussions/58862
function getCacheImpl() {
  const value: {locale?: string} = {locale: undefined};
  return value;
}

const getCache = cache(getCacheImpl);

export function getCachedRequestLocale() {
  return getCache().locale;
}

export function setCachedRequestLocale(locale: string) {
  getCache().locale = locale;
}

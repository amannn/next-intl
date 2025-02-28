import {cache} from 'react';
import type {Locale} from 'use-intl';
import getConfig from './getConfig.js';

async function getTimeZoneCachedImpl(locale?: Locale) {
  const config = await getConfig(locale);
  return config.timeZone;
}
const getTimeZoneCached = cache(getTimeZoneCachedImpl);

export default async function getTimeZone(opts?: {
  locale?: Locale;
}): Promise<Locale> {
  return getTimeZoneCached(opts?.locale);
}

import {cache} from 'react';
import type {Locale} from 'use-intl';
import getConfig from './getConfig.tsx';

async function getNowCachedImpl(locale?: Locale) {
  const config = await getConfig(locale);
  return config.now;
}
const getNowCached = cache(getNowCachedImpl);

export default async function getNow(opts?: {locale?: Locale}): Promise<Date> {
  return getNowCached(opts?.locale);
}

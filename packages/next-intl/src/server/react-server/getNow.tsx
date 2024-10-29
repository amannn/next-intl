import {cache} from 'react';
import getConfig from './getConfig.tsx';

async function getNowCachedImpl(locale?: string) {
  const config = await getConfig(locale);
  return config.now;
}
const getNowCached = cache(getNowCachedImpl);

export default async function getNow(opts?: {locale?: string}): Promise<Date> {
  return getNowCached(opts?.locale);
}

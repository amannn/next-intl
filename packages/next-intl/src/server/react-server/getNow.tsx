import {cache} from 'react';
import getConfig from './getConfig';
import resolveLocaleArg from './resolveLocaleArg';

async function getNowCachedImpl(locale: string) {
  const config = await getConfig(locale);
  return config.now;
}
const getNowCached = cache(getNowCachedImpl);

export default async function getNow(opts?: {locale?: string}): Promise<Date> {
  const locale = await resolveLocaleArg(opts);
  return getNowCached(locale);
}

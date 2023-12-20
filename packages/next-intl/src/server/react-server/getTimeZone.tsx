import {cache} from 'react';
import getConfig from './getConfig';
import resolveLocaleArg from './resolveLocaleArg';

async function getTimeZoneCachedImpl(locale: string) {
  const config = await getConfig(locale);
  return config.timeZone;
}
const getTimeZoneCached = cache(getTimeZoneCachedImpl);

export default async function getTimeZone(opts?: {
  locale?: string;
}): Promise<string> {
  const locale = await resolveLocaleArg(opts);
  return getTimeZoneCached(locale);
}

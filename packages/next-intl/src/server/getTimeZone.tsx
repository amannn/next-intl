import {cache} from 'react';
import getConfig from './getConfig';
import resolveLocaleArg from './resolveLocaleArg';

const getTimeZoneImpl = cache(async (locale: string) => {
  const config = await getConfig(locale);
  return config.timeZone;
});

export default function getTimeZone(opts?: {locale?: string} | string) {
  const locale = resolveLocaleArg('getTimeZone', opts);
  return getTimeZoneImpl(locale);
}

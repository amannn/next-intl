import {cache} from 'react';
import getConfig from './getConfig';
import resolveLocaleArg from './resolveLocaleArg';

const getTimeZoneImpl = cache(async (locale: string) => {
  const config = await getConfig(locale);
  return config.timeZone;
});

export default async function getTimeZone(opts?: {locale?: string}) {
  const locale = await resolveLocaleArg(opts);
  return getTimeZoneImpl(locale);
}

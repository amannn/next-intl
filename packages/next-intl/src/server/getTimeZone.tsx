import {cache} from 'react';
import getConfig from './getConfig';
import getLocale from './getLocale';

const getTimeZoneImpl = cache(async (locale?: string) => {
  const config = await getConfig(locale || getLocale());
  return config.timeZone;
});

export default function getTimeZone(opts?: {locale?: string}) {
  return getTimeZoneImpl(opts?.locale);
}

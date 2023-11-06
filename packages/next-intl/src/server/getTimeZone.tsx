import {cache} from 'react';
import getConfig from './getConfig';
import getLocale from './getLocale';

const getTimeZone = cache(async (opts?: {locale?: string}) => {
  const config = await getConfig(opts?.locale || getLocale());
  return config.timeZone;
});

export default getTimeZone;

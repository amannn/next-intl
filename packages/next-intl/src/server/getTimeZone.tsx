import {cache} from 'react';
import getConfig from './getConfig';

const getTimeZone = cache(async (locale: string) => {
  const config = await getConfig(locale);
  return config.timeZone;
});

export default getTimeZone;

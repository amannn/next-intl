import {cache} from 'react';
import getConfig from './getConfig';

const getTimeZone = cache(async () => {
  const config = await getConfig();
  return config.timeZone;
});

export default getTimeZone;

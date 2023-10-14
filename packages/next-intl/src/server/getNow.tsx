import {cache} from 'react';
import getConfig from './getConfig';

const getNow = cache(async (locale: string) => {
  const config = await getConfig(locale);
  return config.now;
});

export default getNow;

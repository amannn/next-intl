import {cache} from 'react';
import getConfig from './getConfig';
import getLocale from './getLocale';

const getNow = cache(async (opts?: {locale?: string}) => {
  const config = await getConfig(opts?.locale || getLocale());
  return config.now;
});

export default getNow;

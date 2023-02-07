import {cache} from 'react';
import getConfig from './getConfig';

const getNow = cache(async () => {
  const config = await getConfig();
  return config.now;
});

export default getNow;

import {cache} from 'react';
import getConfig from './getConfig';

async function getFormatsCachedImpl() {
  const config = await getConfig();
  return config.formats;
}
const getFormatsCached = cache(getFormatsCachedImpl);

export default getFormatsCached;

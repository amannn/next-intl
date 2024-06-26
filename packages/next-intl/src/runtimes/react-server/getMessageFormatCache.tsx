import {cache} from 'react';

function getMessageFormatCacheImpl() {
  return new Map();
}
const getMessageFormatCache = cache(getMessageFormatCacheImpl);

export default getMessageFormatCache;

import {cache} from 'react';

function getMessageFormatCacheImpl() {
  return new Map();
}
export const getMessageFormatCache = cache(getMessageFormatCacheImpl);

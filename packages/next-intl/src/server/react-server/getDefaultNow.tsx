import {cache} from 'react';

function getDefaultNowImpl() {
  return new Date();
}
const getDefaultNow = cache(getDefaultNowImpl);

export default getDefaultNow;

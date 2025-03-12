import {cache} from 'react';

function defaultNow() {
  // See https://next-intl.dev/docs/usage/dates-times#relative-times-server
  return new Date();
}

const getDefaultNow = cache(defaultNow);

export default getDefaultNow;

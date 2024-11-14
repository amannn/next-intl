import {cache} from 'react';

function defaultNow() {
  // See https://next-intl-docs.vercel.app/docs/usage/dates-times#relative-times-server
  return new Date();
}

const getDefaultNow = cache(defaultNow);

export default getDefaultNow;

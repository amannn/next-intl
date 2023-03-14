import {cache} from 'react';
import {createIntl} from 'use-intl/dist/src/core';
import getConfig from './getConfig';

let hasWarned = false;

/** @deprecated Please switch to `getFormatter`. */
const getIntl = cache(async () => {
  if (!hasWarned) {
    hasWarned = true;
    console.warn(
      '`getIntl()` is deprecated and will be removed in the next major version. Please switch to `getFormatter()`.'
    );
  }

  const config = await getConfig();
  return createIntl(config);
});

export default getIntl;

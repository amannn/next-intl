import {cache} from 'react';
import {createFormatter} from 'use-intl/dist/src/core';
import getConfig from './getConfig';

const getFormatter = cache(async () => {
  const config = await getConfig();
  return createFormatter(config);
});

export default getFormatter;

import {cache} from 'react';
import {createIntl} from 'use-intl/dist/src/core';
import getConfig from './getConfig';

const getIntl = cache(async () => {
  const config = await getConfig();
  return createIntl(config);
});

export default getIntl;

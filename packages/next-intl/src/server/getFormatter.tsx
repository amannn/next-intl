import {cache} from 'react';
import {createFormatter} from 'use-intl/core';
import getConfig from './getConfig';

/**
 * Returns a formatter based on the given locale.
 *
 * The formatter automatically receives the request config, but
 * you can override it by passing in additional options.
 */
const getFormatter = cache(async (locale: string) => {
  const config = await getConfig(locale);
  return createFormatter(config);
});

export default getFormatter;

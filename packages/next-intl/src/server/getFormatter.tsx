import {cache} from 'react';
import {createFormatter} from 'use-intl/core';
import getConfig from './getConfig';
import getLocale from './getLocale';

/**
 * Returns a formatter based on the given locale.
 *
 * The formatter automatically receives the request config, but
 * you can override it by passing in additional options.
 */
const getFormatter = cache(async (opts?: {locale?: string}) => {
  const config = await getConfig(opts?.locale || getLocale());
  return createFormatter(config);
});

export default getFormatter;

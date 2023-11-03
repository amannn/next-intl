import {cache} from 'react';
import {createFormatter} from 'use-intl/core';
import getConfig from './getConfig';
import resolveLocaleArg from './resolveLocaleArg';

/**
 * Returns a formatter based on the given locale.
 *
 * The formatter automatically receives the request config, but
 * you can override it by passing in additional options.
 */
const getFormatter = cache(
  async (optsOrDeprecatedLocale?: {locale?: string} | string) => {
    const config = await getConfig(
      resolveLocaleArg('getFormatter', optsOrDeprecatedLocale)
    );
    return createFormatter(config);
  }
);

export default getFormatter;

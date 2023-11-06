import {cache} from 'react';
import {createFormatter} from 'use-intl/core';
import getConfig from './getConfig';
import getLocale from './getLocale';

const getFormatterImpl = cache(async (locale?: string) => {
  const config = await getConfig(locale || getLocale());
  return createFormatter(config);
});

/**
 * Returns a formatter based on the given locale.
 *
 * The formatter automatically receives the request config, but
 * you can override it by passing in additional options.
 */
export default function getFormatter(opts?: {locale?: string}) {
  return getFormatterImpl(opts?.locale);
}

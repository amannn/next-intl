import {cache} from 'react';
import {createFormatter} from 'use-intl/core';
import getConfig from './getConfig';
import resolveLocaleArg from './resolveLocaleArg';

const getFormatterImpl = cache(async (locale: string) => {
  const config = await getConfig(locale);
  return createFormatter(config);
});

/**
 * Returns a formatter based on the given locale.
 *
 * The formatter automatically receives the request config, but
 * you can override it by passing in additional options.
 */
export default async function getFormatter(opts?: {
  locale?: string;
}): Promise<ReturnType<typeof createFormatter>> {
  const locale = await resolveLocaleArg(opts);
  return getFormatterImpl(locale);
}

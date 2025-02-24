import {cache} from 'react';
import type {Locale, createFormatter} from 'use-intl/core';
import getConfig from './getConfig.js';
import getServerFormatter from './getServerFormatter.js';

async function getFormatterCachedImpl(locale?: Locale) {
  const config = await getConfig(locale);
  return getServerFormatter(config);
}
const getFormatterCached = cache(getFormatterCachedImpl);

/**
 * Returns a formatter based on the given locale.
 *
 * The formatter automatically receives the request config, but
 * you can override it by passing in additional options.
 */
export default async function getFormatter(opts?: {
  locale?: Locale;
}): Promise<ReturnType<typeof createFormatter>> {
  return getFormatterCached(opts?.locale);
}

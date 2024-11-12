import {cache} from 'react';
import type {Locale} from 'use-intl';
import getConfig from './getConfig.tsx';

async function getConfigNowImpl(locale?: Locale) {
  const config = await getConfig(locale);
  return config.now;
}
const getConfigNow = cache(getConfigNowImpl);

export default getConfigNow;

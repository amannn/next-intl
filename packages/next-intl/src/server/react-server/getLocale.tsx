import {cache} from 'react';
import type {Locale} from 'use-intl';
import getConfig from './getConfig.tsx';

async function getLocaleCachedImpl(): Promise<Locale> {
  const config = await getConfig();
  return config.locale;
}
const getLocaleCached = cache(getLocaleCachedImpl);

export default getLocaleCached;

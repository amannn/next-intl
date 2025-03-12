import type {Locale} from 'use-intl';
import getConfigNow from './getConfigNow.js';
import getDefaultNow from './getDefaultNow.js';

export default async function getNow(opts?: {locale?: Locale}): Promise<Date> {
  return (await getConfigNow(opts?.locale)) ?? getDefaultNow();
}

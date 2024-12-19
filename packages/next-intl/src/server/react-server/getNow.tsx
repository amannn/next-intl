import type {Locale} from 'use-intl';
import getConfigNow from './getConfigNow.tsx';
import getDefaultNow from './getDefaultNow.tsx';

export default async function getNow(opts?: {locale?: Locale}): Promise<Date> {
  return (await getConfigNow(opts?.locale)) ?? getDefaultNow();
}

import {cache} from 'react';
import getConfig from './getConfig';
import resolveLocaleArg from './resolveLocaleArg';

const getNowImpl = cache(async (locale: string) => {
  const config = await getConfig(locale);
  return config.now;
});

export default function getNow(opts?: {locale?: string} | string) {
  const locale = resolveLocaleArg('getNow', opts);
  return getNowImpl(locale);
}

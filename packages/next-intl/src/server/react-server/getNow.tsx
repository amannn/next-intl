import {cache} from 'react';
import getConfig from './getConfig';
import resolveLocaleArg from './resolveLocaleArg';

const getNowImpl = cache(async (locale: string) => {
  const config = await getConfig(locale);
  return config.now;
});

export default async function getNow(opts?: {locale?: string}) {
  const locale = await resolveLocaleArg(opts);
  return getNowImpl(locale);
}

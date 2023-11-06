import {cache} from 'react';
import getConfig from './getConfig';
import getLocale from './getLocale';

const getNowImpl = cache(async (locale?: string) => {
  const config = await getConfig(locale || getLocale());
  return config.now;
});

export default function getNow(opts?: {locale?: string}) {
  return getNowImpl(opts?.locale);
}

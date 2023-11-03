import {cache} from 'react';
import getConfig from './getConfig';
import resolveLocaleArg from './resolveLocaleArg';

const getTimeZone = cache(
  async (optsOrDeprecatedLocale?: {locale?: string} | string) => {
    const config = await getConfig(
      resolveLocaleArg('getTimeZone', optsOrDeprecatedLocale)
    );
    return config.timeZone;
  }
);

export default getTimeZone;

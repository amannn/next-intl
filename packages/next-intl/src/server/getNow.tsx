import {cache} from 'react';
import getConfig from './getConfig';
import resolveLocaleArg from './resolveLocaleArg';

const getNow = cache(
  async (optsOrDeprecatedLocale?: {locale?: string} | string) => {
    const config = await getConfig(
      resolveLocaleArg('getNow', optsOrDeprecatedLocale)
    );
    return config.now;
  }
);

export default getNow;

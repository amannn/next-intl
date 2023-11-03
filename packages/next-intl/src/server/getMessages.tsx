import {cache} from 'react';
import getConfig from './getConfig';
import resolveLocaleArg from './resolveLocaleArg';

const getMessages = cache(
  async (optsOrDeprecatedLocale?: {locale?: string} | string) => {
    const config = await getConfig(
      resolveLocaleArg('getMessages', optsOrDeprecatedLocale)
    );

    if (!config.messages) {
      throw new Error(
        'No messages found. Have you configured them correctly? See https://next-intl-docs.vercel.app/docs/configuration#messages'
      );
    }

    return config.messages;
  }
);

export default getMessages;

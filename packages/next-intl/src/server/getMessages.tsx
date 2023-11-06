import {cache} from 'react';
import getConfig from './getConfig';
import getLocale from './getLocale';

const getMessages = cache(async (opts?: {locale?: string}) => {
  const config = await getConfig(opts?.locale || getLocale());

  if (!config.messages) {
    throw new Error(
      'No messages found. Have you configured them correctly? See https://next-intl-docs.vercel.app/docs/configuration#messages'
    );
  }

  return config.messages;
});

export default getMessages;

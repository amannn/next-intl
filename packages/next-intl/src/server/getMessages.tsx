import {cache} from 'react';
import getConfig from './getConfig';

const getMessages = cache(async (locale: string) => {
  const config = await getConfig(locale);

  if (!config.messages) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? 'No messages found. Have you configured them correctly? See https://next-intl-docs.vercel.app/docs/configuration#messages'
        : undefined
    );
  }

  return config.messages;
});

export default getMessages;

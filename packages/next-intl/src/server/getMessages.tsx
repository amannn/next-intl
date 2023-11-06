import {cache} from 'react';
import getConfig from './getConfig';
import getLocale from './getLocale';
import resolveLocaleArg from './resolveLocaleArg';

const getMessagesImpl = cache(async (locale?: string) => {
  const config = await getConfig(locale || getLocale());

  if (!config.messages) {
    throw new Error(
      'No messages found. Have you configured them correctly? See https://next-intl-docs.vercel.app/docs/configuration#messages'
    );
  }

  return config.messages;
});

export default function getMessages(opts?: {locale?: string} | string) {
  const locale = resolveLocaleArg('getMessages', opts);
  return getMessagesImpl(locale);
}

import {cache} from 'react';
import getConfig from './getConfig';

const getMessages = cache(async (locale: string) => {
  const config = await getConfig(locale);
  return config.messages;
});

export default getMessages;

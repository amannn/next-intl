import {cache} from 'react';
import type {AbstractIntlMessages} from 'use-intl';
import getConfig from './getConfig';
import resolveLocaleArg from './resolveLocaleArg';

async function getMessagesCachedImpl(locale: string) {
  const config = await getConfig(locale);

  if (!config.messages) {
    throw new Error(
      'No messages found. Have you configured them correctly? See https://next-intl-docs.vercel.app/docs/configuration#messages'
    );
  }

  return config.messages;
}
const getMessagesCached = cache(getMessagesCachedImpl);

export default async function getMessages(opts?: {
  locale?: string;
}): Promise<AbstractIntlMessages> {
  const locale = await resolveLocaleArg(opts);
  return getMessagesCached(locale);
}

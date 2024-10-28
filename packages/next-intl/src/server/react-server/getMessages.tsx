import {cache} from 'react';
import type {AbstractIntlMessages} from 'use-intl';
import getConfig from './getConfig.tsx';

export function getMessagesFromConfig(
  config: Awaited<ReturnType<typeof getConfig>>
): AbstractIntlMessages {
  if (!config.messages) {
    throw new Error(
      'No messages found. Have you configured them correctly? See https://next-intl-docs.vercel.app/docs/configuration#messages'
    );
  }
  return config.messages;
}

async function getMessagesCachedImpl(locale?: string) {
  const config = await getConfig(locale);
  return getMessagesFromConfig(config);
}
const getMessagesCached = cache(getMessagesCachedImpl);

export default async function getMessages(opts?: {
  locale?: string;
}): Promise<AbstractIntlMessages> {
  return getMessagesCached(opts?.locale);
}

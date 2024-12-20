import {cache} from 'react';
import type {Locale, useMessages as useMessagesType} from 'use-intl';
import getConfig from './getConfig.tsx';

export function getMessagesFromConfig(
  config: Awaited<ReturnType<typeof getConfig>>
): ReturnType<typeof useMessagesType> {
  if (!config.messages) {
    throw new Error(
      'No messages found. Have you configured them correctly? See https://next-intl.dev/docs/configuration#messages'
    );
  }
  return config.messages;
}

async function getMessagesCachedImpl(locale?: Locale) {
  const config = await getConfig(locale);
  return getMessagesFromConfig(config);
}
const getMessagesCached = cache(getMessagesCachedImpl);

export default async function getMessages(opts?: {
  locale?: Locale;
}): Promise<ReturnType<typeof useMessagesType>> {
  return getMessagesCached(opts?.locale);
}

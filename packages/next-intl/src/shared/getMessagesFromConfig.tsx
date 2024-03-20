import type {AbstractIntlMessages} from 'use-intl/core';
import {ServerIntlConfig} from './types';

export default function getMessagesFromConfig(
  config: ServerIntlConfig
): AbstractIntlMessages {
  if (!config.messages) {
    throw new Error(
      'No messages found. Have you configured them correctly? See https://next-intl-docs.vercel.app/docs/configuration#messages'
    );
  }
  return config.messages;
}

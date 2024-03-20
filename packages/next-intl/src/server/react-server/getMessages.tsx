import {cache} from 'react';
import type {AbstractIntlMessages} from 'use-intl';
import getMessagesFromConfig from '../../shared/getMessagesFromConfig';
import getConfig from './getConfig';
import resolveLocaleArg from './resolveLocaleArg';

async function getMessagesCachedImpl(locale: string) {
  const config = await getConfig(locale);
  return getMessagesFromConfig(config);
}
const getMessagesCached = cache(getMessagesCachedImpl);

export default async function getMessages(opts?: {
  locale?: string;
}): Promise<AbstractIntlMessages> {
  const locale = await resolveLocaleArg(opts);
  return getMessagesCached(locale);
}

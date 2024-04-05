import {cache} from 'react';
import type {Formats} from 'use-intl';
import getConfig from './getConfig';
import resolveLocaleArg from './resolveLocaleArg';

export function getFormatsFromConfig(
  config: Awaited<ReturnType<typeof getConfig>>
): Partial<Formats> {
  if (!config.formats) {
    throw new Error(
      'No formats found. Have you configured them correctly? See https://next-intl-docs.vercel.app/docs/configuration#formats'
    );
  }
  return config.formats;
}

async function getFormatsCachedImpl(locale: string) {
  const config = await getConfig(locale);
  return getFormatsFromConfig(config);
}
const getFormatsCached = cache(getFormatsCachedImpl);

export default async function getFormats(opts?: {
  locale?: string;
}): Promise<Partial<Formats>> {
  const locale = await resolveLocaleArg(opts);
  return getFormatsCached(locale);
}

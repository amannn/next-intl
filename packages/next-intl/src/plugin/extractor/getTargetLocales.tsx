import fs from 'fs/promises';
import path from 'path';
import type {Locale} from '@eloqnt/messages/_internal';

/**
 * The locales to write besides the source locale. With `'infer'`, these are
 * the messages files that exist in `messagesDir`.
 */
export default async function getTargetLocales(params: {
  messagesDir: string;
  sourceLocale: Locale;
  extension: string;
  locales: 'infer' | ReadonlyArray<Locale>;
}): Promise<Array<Locale>> {
  if (params.locales !== 'infer') {
    return params.locales.filter((locale) => locale !== params.sourceLocale);
  }

  try {
    const files = await fs.readdir(params.messagesDir);
    return files
      .filter((file) => file.endsWith(params.extension))
      .map((file) => path.basename(file, params.extension))
      .filter((locale) => locale !== params.sourceLocale);
  } catch {
    return [];
  }
}

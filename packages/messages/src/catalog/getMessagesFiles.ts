import UserError from '../UserError.js';
import type {Locale, MessagesPathEntry} from '../types.js';
import {
  createLocaleCodes,
  discoverFiles,
  hasToken,
  parsePathEntry,
  substituteTemplate
} from './pathTemplate.js';

/**
 * The messages file of each locale, the source locale first. With `'infer'`,
 * the target locales are the messages files that exist.
 */
export default async function getMessagesFiles(params: {
  path: MessagesPathEntry;
  codes?: Record<Locale, string>;
  rootDir: string;
  extension: string;
  sourceLocale: Locale;
  locales: 'infer' | ReadonlyArray<Locale>;
}): Promise<Map<Locale, string>> {
  const {extension, rootDir, sourceLocale} = params;
  const entry = parsePathEntry(params.path);
  const localeCodes = createLocaleCodes(
    params.codes,
    params.locales === 'infer' ? undefined : [sourceLocale, ...params.locales]
  );
  const targets = entry.kind === 'split' ? entry.targets : entry.template;
  if (hasToken(targets, 'namespace')) {
    throw new UserError(
      `messages.path "${targets.source}" splits messages by {namespace}, which extraction doesn't support yet`,
      {hint: 'Point messages.path at one file per locale.'}
    );
  }

  function getFilePath(locale: Locale) {
    return substituteTemplate(
      entry.kind === 'split' && locale === sourceLocale
        ? entry.source
        : targets,
      {locale, namespace: undefined},
      rootDir,
      extension,
      localeCodes
    );
  }

  const sourceFilePath = getFilePath(sourceLocale);
  const files = new Map([[sourceLocale, sourceFilePath]]);

  if (params.locales !== 'infer') {
    for (const locale of params.locales) {
      if (locale !== sourceLocale) files.set(locale, getFilePath(locale));
    }
    return files;
  }

  const matches = await discoverFiles({
    template: targets,
    rootDir,
    extension,
    localeCodes
  });
  for (const match of matches) {
    // The source path is authoritative for the source locale, e.g. with
    // `{source: 'messages/en', targets: 'messages/{locale}'}`
    if (match.locale === sourceLocale || match.filePath === sourceFilePath) {
      continue;
    }
    const existing = files.get(match.locale!);
    if (existing !== undefined) {
      throw new UserError(
        `Both "${existing}" and "${match.filePath}" map to the locale "${match.locale}"`,
        {
          hint: 'Give each locale its own code in messages.codes, so a file maps back to a single locale.'
        }
      );
    }
    files.set(match.locale!, match.filePath);
  }
  return files;
}

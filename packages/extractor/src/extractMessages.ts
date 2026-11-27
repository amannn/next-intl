import fs from 'fs/promises';
import {
  CatalogPersister,
  type ExtractorMessage,
  type Locale,
  UserError,
  getFormatExtension,
  getMessagesFiles,
  resolveCodec
} from '@eloqnt/messages/_internal';
import {
  aggregateMessage,
  fillUnownedFields,
  getLocaleMessages,
  groupSourceMessagesById
} from './catalog/mergeMessages.js';
import MessageExtractor from './extractor/MessageExtractor.js';
import SourceFileScanner from './source/SourceFileScanner.js';
import type {ExtractorConfig, SourceExtractedMessage} from './types.js';
import {
  describeParseFailures,
  getDefaultProjectRoot,
  getSrcPaths,
  localeCompare
} from './utils.js';

type ExtractMessagesResult = {
  messageCount: number;
  /** Source locale first. */
  files: Array<{locale: Locale; filePath: string; updated: boolean}>;
};

/**
 * Extracts the messages of all source files and writes them to the messages
 * files of every locale.
 */
export default async function extractMessages(
  config: ExtractorConfig,
  opts: {projectRoot?: string; warn?(message: string): void} = {}
): Promise<ExtractMessagesResult> {
  const projectRoot = opts.projectRoot ?? getDefaultProjectRoot();
  const {sourceLocale} = config.extract;
  const files = await getMessagesFiles({
    path: config.extract.path,
    codes: config.messages.codes,
    rootDir: projectRoot,
    extension: getFormatExtension(config.messages.format),
    sourceLocale,
    locales: config.extract.locales
  });
  const persister = new CatalogPersister({
    getFilePath: (locale) => files.get(locale)!,
    codec: await resolveCodec(config.messages.format, projectRoot),
    sourceLocale,
    warn: opts.warn
  });

  // Read to keep codec fields (e.g. flags), the source code is the source of
  // truth for everything else
  const sourceDiskMessages = await persister.read(sourceLocale);

  const targetLocales = Array.from(files.keys()).filter(
    (locale) => locale !== sourceLocale
  );
  const translationsByLocale = new Map(
    await Promise.all(
      targetLocales.map(
        async (locale) =>
          [locale, mapById(await persister.read(locale))] as const
      )
    )
  );

  const extractor = new MessageExtractor({
    projectRoot,
    mdx: config.extract.mdx
  });
  const sourceFiles = Array.from(
    await SourceFileScanner.getSourceFiles(
      getSrcPaths(config, projectRoot),
      config.extract.mdx
    )
  )
    // Stable file order keeps catalog ties independent of processing timing
    .toSorted(localeCompare);
  const extractedFiles = await Promise.all(
    sourceFiles.map(async (filePath) => ({
      filePath,
      result: await extractFile(extractor, filePath)
    }))
  );

  const failures = extractedFiles.flatMap(({filePath, result}) =>
    'error' in result ? [{filePath, error: result.error}] : []
  );
  if (failures.length > 0) {
    // Writing nothing beats messages files that miss the messages of the files
    // that couldn't be parsed
    throw new UserError(
      `Could not extract messages, no messages files were updated.\n\n${describeParseFailures(failures, projectRoot)}`
    );
  }

  const sourceMessagesById = new Map<string, Array<SourceExtractedMessage>>();
  for (const {result} of extractedFiles) {
    if (!('messages' in result)) continue;
    for (const [id, fileMessages] of groupSourceMessagesById(result.messages)) {
      const existing = sourceMessagesById.get(id);
      if (existing) {
        existing.push(...fileMessages);
      } else {
        sourceMessagesById.set(id, fileMessages);
      }
    }
  }

  const messagesById = new Map<string, ExtractorMessage>();
  for (const [id, sourceMessages] of sourceMessagesById) {
    messagesById.set(id, aggregateMessage(id, sourceMessages));
  }
  for (const diskMessage of sourceDiskMessages) {
    const message = messagesById.get(diskMessage.id);
    if (message) fillUnownedFields(message, diskMessage);
  }

  const sourceUpdated = await persister.write(
    getLocaleMessages(messagesById, messagesById, true),
    {locale: sourceLocale, sourceMessagesById: messagesById}
  );
  const targetsUpdated = await Promise.all(
    targetLocales.map((locale) =>
      persister.write(
        getLocaleMessages(
          messagesById,
          translationsByLocale.get(locale),
          false
        ),
        {locale, sourceMessagesById: messagesById}
      )
    )
  );

  return {
    messageCount: messagesById.size,
    files: [sourceLocale, ...targetLocales].map((locale, index) => ({
      locale,
      filePath: files.get(locale)!,
      updated: index === 0 ? sourceUpdated : targetsUpdated[index - 1]
    }))
  };
}

function mapById(
  messages: Array<ExtractorMessage>
): Map<string, ExtractorMessage> {
  return new Map(messages.map((message) => [message.id, message]));
}

async function extractFile(
  extractor: MessageExtractor,
  absoluteFilePath: string
): Promise<{messages: Array<SourceExtractedMessage>} | {error: unknown}> {
  let content: string;
  try {
    content = await fs.readFile(absoluteFilePath, 'utf8');
  } catch (error) {
    // Deleted since the scan
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {messages: []};
    }
    throw error;
  }
  try {
    return {messages: await extractor.extract(absoluteFilePath, content)};
  } catch (error) {
    return {error};
  }
}

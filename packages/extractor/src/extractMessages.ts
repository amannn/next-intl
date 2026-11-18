import fs from 'fs/promises';
import path from 'path';
import {
  CatalogPersister,
  type ExtractorMessage,
  getFormatExtension,
  getTargetLocales,
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
import {getDefaultProjectRoot, getSrcPaths, localeCompare} from './utils.js';

/**
 * Extracts the messages of all source files and writes them to the messages
 * files of every locale.
 */
export default async function extractMessages(
  config: ExtractorConfig,
  opts: {projectRoot?: string; warn?(message: string): void} = {}
): Promise<void> {
  const projectRoot = opts.projectRoot ?? getDefaultProjectRoot();
  const {sourceLocale} = config.extract;
  const extension = getFormatExtension(config.messages.format);
  const messagesDir = path.resolve(projectRoot, config.extract.path);
  const persister = new CatalogPersister({
    messagesPath: messagesDir,
    codec: await resolveCodec(config.messages.format, projectRoot),
    extension,
    sourceLocale,
    warn: opts.warn
  });

  // Read to keep codec fields (e.g. flags), the source code is the source of
  // truth for everything else
  const sourceDiskMessages = await persister.read(sourceLocale);

  const targetLocales = await getTargetLocales({
    messagesDir,
    extension,
    locales: config.extract.locales,
    sourceLocale
  });
  const translationsByLocale = new Map(
    await Promise.all(
      targetLocales.map(
        async (locale) =>
          [locale, mapById(await persister.read(locale))] as const
      )
    )
  );

  const extractor = new MessageExtractor({projectRoot});
  const sourceFiles = Array.from(
    await SourceFileScanner.getSourceFiles(getSrcPaths(config, projectRoot))
  )
    // Stable file order keeps catalog ties independent of processing timing
    .toSorted(localeCompare);
  const extractedFiles = await Promise.all(
    sourceFiles.map((filePath) => extractFile(extractor, filePath))
  );

  const sourceMessagesById = new Map<string, Array<SourceExtractedMessage>>();
  for (const messages of extractedFiles) {
    if (!messages) continue;
    for (const [id, fileMessages] of groupSourceMessagesById(messages)) {
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

  await persister.write(getLocaleMessages(messagesById, messagesById, true), {
    locale: sourceLocale,
    sourceMessagesById: messagesById
  });
  await Promise.all(
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
}

function mapById(
  messages: Array<ExtractorMessage>
): Map<string, ExtractorMessage> {
  return new Map(messages.map((message) => [message.id, message]));
}

async function extractFile(
  extractor: MessageExtractor,
  absoluteFilePath: string
): Promise<Array<SourceExtractedMessage> | undefined> {
  let content: string;
  try {
    content = await fs.readFile(absoluteFilePath, 'utf8');
  } catch (error) {
    // Deleted since the scan
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  try {
    return await extractor.extract(absoluteFilePath, content);
  } catch {
    return undefined;
  }
}

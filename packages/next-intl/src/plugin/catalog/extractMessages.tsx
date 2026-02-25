import path from 'path';
import CatalogLocales from '../../extractor/catalog/CatalogLocales.js';
import CatalogPersister from '../../extractor/catalog/CatalogPersister.js';
import type ExtractorCodec from '../../extractor/format/ExtractorCodec.js';
import {getFormatExtension} from '../../extractor/format/index.js';
import type {
  ExtractorMessage,
  Locale,
  MessagesConfig
} from '../../extractor/types.js';
import {compareReferences} from '../../extractor/utils.js';
import Scanner from '../../scanner/Scanner.js';

export type ExtractMessagesConfig = {
  codec: ExtractorCodec;
  messages: MessagesConfig;
  sourceLocale: string;
  srcPaths: Array<string>;
  tsconfigPath: string;
};

let scanner: Scanner | null = null;

export default async function extractMessages(
  projectRoot: string,
  options: ExtractMessagesConfig
): Promise<string> {
  if (!scanner) {
    scanner = new Scanner({
      entry: options.srcPaths,
      projectRoot,
      tsconfigPath: options.tsconfigPath
    });
  }
  const result = await scanner.scan();

  const messagesById = mergeMessagesByFile(result.messagesByFile, projectRoot);

  const extension = getFormatExtension(options.messages.format);
  const persister = new CatalogPersister({
    codec: options.codec,
    extension,
    messagesPath: path.resolve(projectRoot, options.messages.path)
  });

  const catalogLocales = new CatalogLocales({
    extension,
    locales: options.messages.locales,
    messagesDir: path.resolve(projectRoot, options.messages.path),
    sourceLocale: options.sourceLocale
  });
  const targetLocales = await catalogLocales.getTargetLocales();

  const messages = Array.from(messagesById.values());

  await persister.read(options.sourceLocale);
  const sourceContent = await persister.write(messages, {
    locale: options.sourceLocale,
    sourceMessagesById: messagesById
  });

  for (const locale of targetLocales) {
    const diskMessages = await persister.read(locale);
    const translationsByTarget = new Map<string, ExtractorMessage>();
    for (const m of diskMessages) {
      translationsByTarget.set(m.id, m);
    }
    const messagesToPersist = messages.map((msg) => {
      const localeMsg = translationsByTarget.get(msg.id);
      return {
        ...localeMsg,
        description: msg.description,
        id: msg.id,
        message: localeMsg?.message ?? '',
        references: msg.references
      };
    });
    await persister.write(messagesToPersist, {
      locale: locale as Locale,
      sourceMessagesById: messagesById
    });
  }
  return sourceContent;
}

function mergeMessagesByFile(
  messagesByFile: Map<string, Array<ExtractorMessage>>,
  projectRoot: string
): Map<string, ExtractorMessage> {
  const messagesById = new Map<string, ExtractorMessage>();
  for (const [filePath, messages] of messagesByFile) {
    const relativePath = path
      .relative(projectRoot, filePath)
      .split(path.sep)
      .join('/');
    for (let message of messages) {
      const prev = messagesById.get(message.id);
      if (prev) {
        message = {...message};
        if (message.references && prev.references) {
          const otherRefs = prev.references.filter(
            (ref) => ref.path !== relativePath
          );
          message.references = [...otherRefs, ...message.references].sort(
            compareReferences
          );
        }
        for (const key of Object.keys(prev)) {
          if (message[key] == null) message[key] = prev[key];
        }
      }
      messagesById.set(message.id, message);
    }
  }
  return messagesById;
}

import {
  ExtractionCompiler,
  MessageExtractor
} from '@eloqnt/extractor/_internal';
import {warn} from '../plugin/utils.js';
import normalizeExtractorConfig from './normalizeExtractorConfig.js';
import type {ExtractorConfigInput} from './types.js';
import {getDefaultProjectRoot, hasLocalesToExtract} from './utils.js';

export default async function extractMessages(params: ExtractorConfigInput) {
  const config = normalizeExtractorConfig(params);

  if (!hasLocalesToExtract(config)) {
    warn('`messages.locales` is empty, so no messages were updated.');
    return;
  }

  const compiler = new ExtractionCompiler(config, {
    extractor: new MessageExtractor({
      isDevelopment: false,
      projectRoot: getDefaultProjectRoot()
    })
  });

  // Kept from when the compiler registered these itself, so that
  // `unstable_extractMessages` behaves as before
  const cleanup = compiler[Symbol.dispose];
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  await compiler.extractAll();
}

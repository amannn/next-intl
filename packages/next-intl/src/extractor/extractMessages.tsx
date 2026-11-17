import {
  ExtractionCompiler,
  MessageExtractor
} from '@eloqnt/extractor/_internal';
import prefixUserError from '../plugin/prefixUserError.js';
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
    }),
    warn
  });

  try {
    await compiler.extractAll();
  } catch (error) {
    throw prefixUserError(error);
  }
}

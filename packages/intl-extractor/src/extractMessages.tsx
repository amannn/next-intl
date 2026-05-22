import ExtractionCompiler from './ExtractionCompiler.js';
import MessageExtractor from './extractor/MessageExtractor.js';
import normalizeExtractorConfig from './normalizeExtractorConfig.js';
import type {ExtractorConfigInput} from './types.js';
import {getDefaultProjectRoot, hasLocalesToExtract, warn} from './utils.js';

export default async function extractMessages(params: ExtractorConfigInput) {
  const config = normalizeExtractorConfig(params);

  if (!hasLocalesToExtract(config)) {
    warn('`messages.locales` is empty, so no messages were updated.');
    return;
  }

  const compiler = new ExtractionCompiler(config, {
    extractor: new MessageExtractor({
      isDevelopment: false,
      projectRoot: getDefaultProjectRoot(),
      ...(config.referenceRoot != null && {referenceRoot: config.referenceRoot})
    })
  });
  await compiler.extractAll();
}

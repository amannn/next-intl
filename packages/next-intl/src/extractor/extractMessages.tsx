import {warn} from '../plugin/utils.js';
import ExtractionCompiler from './ExtractionCompiler.js';
import MessageExtractor from './extractor/MessageExtractor.js';
import normalizeExtractorConfig from './normalizeExtractorConfig.js';
import type {ExtractorConfigInput} from './types.js';
import {getDefaultProjectRoot, hasLocalesToExtract} from './utils.js';

export default async function extractMessages(params: ExtractorConfigInput) {
  const config = normalizeExtractorConfig(params);

  if (!hasLocalesToExtract(config)) {
    warn('`extract.locales` is empty, so no messages were updated.');
    return;
  }

  const compiler = new ExtractionCompiler(config, {
    extractor: new MessageExtractor({
      isDevelopment: false,
      projectRoot: getDefaultProjectRoot()
    })
  });
  await compiler.extractAll();
}

import ExtractionCompiler from './ExtractionCompiler.js';
import MessageExtractor from './extractor/MessageExtractor.js';
import normalizeExtractorConfig, {
  type ExtractorInput
} from './normalizeExtractorConfig.js';
import {getDefaultProjectRoot} from './utils.js';

export default async function extractMessages(params: ExtractorInput) {
  const config = normalizeExtractorConfig(params);
  const compiler = new ExtractionCompiler(config, {
    extractor: new MessageExtractor({
      isDevelopment: false,
      projectRoot: getDefaultProjectRoot()
    })
  });
  await compiler.extractAll();
}

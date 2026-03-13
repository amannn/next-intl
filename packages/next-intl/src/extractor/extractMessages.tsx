import ExtractionCompiler from './ExtractionCompiler.js';
import MessageExtractor from './extractor/MessageExtractor.js';
import type {ExtractorConfig} from './types.js';
import {getDefaultProjectRoot} from './utils.js';

export default async function extractMessages(params: ExtractorConfig) {
  const compiler = new ExtractionCompiler(params, {
    extractor: new MessageExtractor({
      isDevelopment: false,
      projectRoot: getDefaultProjectRoot()
    })
  });
  await compiler.extractAll();
}

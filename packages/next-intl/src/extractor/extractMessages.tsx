import ExtractionCompiler from './ExtractionCompiler.js';
import type {ExtractorConfig} from './types.js';

export default async function extractMessages(params: ExtractorConfig) {
  const compiler = new ExtractionCompiler(params);
  await compiler.extract();
}

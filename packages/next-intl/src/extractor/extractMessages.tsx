import ExtractionCompiler from './ExtractionCompiler.js';
import MessageExtractor from './extractor/MessageExtractor.js';
import type {ExtractMessagesParams, ExtractorConfig} from './types.js';

export default async function extractMessages(params: ExtractMessagesParams) {
  const {srcPath, ...rest} = params;
  const config: ExtractorConfig = {
    ...rest,
    srcPaths: Array.isArray(srcPath) ? srcPath : [srcPath]
  };
  const projectRoot = process.cwd();
  const compiler = new ExtractionCompiler(config, {
    projectRoot,
    extractor: new MessageExtractor({
      isDevelopment: false,
      projectRoot
    })
  });
  await compiler.extractAll();
}

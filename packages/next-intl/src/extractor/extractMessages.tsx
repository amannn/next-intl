import path from 'path';
import ExtractionCompiler from './ExtractionCompiler.js';
import {resolveCodec} from './format/index.js';
import type {ExtractMessagesParams} from './types.js';

export default async function extractMessages(params: ExtractMessagesParams) {
  const {srcPath, ...rest} = params;
  const projectRoot = process.cwd();
  const srcPaths = Array.isArray(srcPath) ? srcPath : [srcPath];
  const codec = await resolveCodec(rest.messages.format, projectRoot);
  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');

  const compiler = new ExtractionCompiler({
    isDevelopment: false,
    messages: rest.messages,
    sourceLocale: rest.sourceLocale,
    codec,
    projectRoot,
    srcPaths,
    tsconfigPath
  });
  await compiler.extract();
}

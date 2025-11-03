import path from 'path';
import ExtractionCompiler from '../../extractor/ExtractionCompiler.js';
import SourceFileFilter from '../../extractor/source/SourceFileFilter.js';
import type {ExtractorConfig} from '../../extractor/types.js';
import type {TurbopackLoaderContext} from '../types.js';

// This instance:
// - Remains available through HMR
// - Is the same across react-client and react-server
// - Is only lost when the dev server restarts (e.g. due to change to Next.js config)
let compiler: ExtractionCompiler | undefined;

// Cache computation
let srcPaths: Array<string> | undefined;

export default function extractMessagesLoader(
  this: TurbopackLoaderContext<ExtractorConfig>,
  source: string
) {
  const options = this.getOptions();

  if (!srcPaths) {
    srcPaths = (
      Array.isArray(options.srcPath) ? options.srcPath : [options.srcPath]
    ).map((srcPath) => path.join(process.cwd(), srcPath));
  }

  // Check if the file is within any of the `srcPath`s.
  // TODO: Remove this in favor of `conditions` in Next.js 16.
  // In this case we can also use `content: /(useExtracted|getExtracted)/`
  if (!SourceFileFilter.shouldProcessFile(this.resourcePath, srcPaths)) {
    return source;
  }

  if (!compiler) {
    compiler = new ExtractionCompiler(options, {
      // Avoid rollup's `replace` plugin to compile this away
      isDevelopment: process.env['NODE_ENV'.trim()] === 'development'
    });
  }

  const callback = this.async();

  compiler
    .compile(this.resourcePath, source)
    .then((result) => {
      callback(null, result);
    })
    .catch(callback);
}

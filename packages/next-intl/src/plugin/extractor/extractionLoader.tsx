import ExtractionCompiler from '../../extractor/ExtractionCompiler.js';
import type {ExtractorConfig} from '../../extractor/types.js';
import type {TurbopackLoaderContext} from '../types.js';

// This instance:
// - Remains available through HMR
// - Is the same across react-client and react-server
// - Is only lost when the dev server restarts (e.g. due to change to Next.js config)
let compiler: ExtractionCompiler | undefined;

export default function extractionLoader(
  this: TurbopackLoaderContext<ExtractorConfig>,
  source: string
) {
  const options = this.getOptions();
  const callback = this.async();

  if (!compiler) {
    compiler = new ExtractionCompiler(options, {
      // Avoid rollup's `replace` plugin to compile this away
      isDevelopment: process.env['NODE_ENV'.trim()] === 'development',
      sourceMap: this.sourceMap
    });
  }

  compiler
    .compile(this.resourcePath, source)
    .then((result) => {
      callback(null, result.code, result.map);
    })
    .catch(callback);
}

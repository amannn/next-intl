import ExtractionCompiler from '../../extractor/ExtractionCompiler.js';
import MessageExtractor from '../../extractor/extractor/MessageExtractor.js';
import type {ExtractorConfig} from '../../extractor/types.js';
import type {TurbopackLoaderContext} from '../types.js';

// This instance:
// - Remains available through HMR
// - Is the same across react-client and react-server
// - Is only lost when the dev server restarts (e.g. due to change to Next.js config)
let compiler: ExtractionCompiler | undefined;
let extractor: MessageExtractor | undefined;
let extractAllPromise: Promise<void> | undefined;

export default function extractionLoader(
  this: TurbopackLoaderContext<ExtractorConfig>,
  source: string
) {
  const options = this.getOptions();
  const callback = this.async();
  const projectRoot = this.rootContext;

  // Avoid rollup's `replace` plugin to compile this away
  const isDevelopment = process.env['NODE_ENV'.trim()] === 'development';

  if (!extractor) {
    extractor = new MessageExtractor({
      isDevelopment,
      projectRoot,
      sourceMap: this.sourceMap
    });
  }

  if (!compiler) {
    compiler = new ExtractionCompiler(options, {
      isDevelopment,
      projectRoot,
      sourceMap: this.sourceMap,
      extractor
    });
  }

  if (!extractAllPromise) {
    extractAllPromise = compiler.extractAll();
  }

  extractor
    .extract(this.resourcePath, source)
    .then(async (result) => {
      if (!isDevelopment) {
        await extractAllPromise;
      }
      callback(null, result.code, result.map);
    })
    .catch(callback);
}

import ExtractionCompiler from '../../extractor/ExtractionCompiler.js';
import MessageExtractor from '../../extractor/extractor/MessageExtractor.js';
import type {ExtractorConfig} from '../../extractor/types.js';
import type {TurbopackLoaderContext} from '../types.js';

// This instance:
// - Remains available through HMR
// - Is the same across react-client and react-server
// - Is only lost when the dev server restarts (e.g. due to change to Next.js config)
let compiler: ExtractionCompiler | undefined;
let messageExtractor: MessageExtractor | undefined;
let extractAllPromise: Promise<void> | undefined;

export default function extractionLoader(
  this: TurbopackLoaderContext<ExtractorConfig>,
  source: string
) {
  const options = this.getOptions();
  const callback = this.async();
  const projectRoot = this.rootContext || process.cwd();

  // Avoid rollup's `replace` plugin to compile this awa
  const isDevelopment = process.env['NODE_ENV'.trim()] === 'development';

  if (!messageExtractor) {
    messageExtractor = new MessageExtractor({
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
      messageExtractor
    });
  }

  if (!extractAllPromise) {
    extractAllPromise = compiler.extractAll();
  }

  messageExtractor.extract(this.resourcePath, source).then(async (result) => {
    if (!isDevelopment) {
      await extractAllPromise;
    }
    callback(null, result.code, result.map);
  });
}

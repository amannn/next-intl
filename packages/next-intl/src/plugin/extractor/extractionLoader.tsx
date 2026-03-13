import MessageExtractor from '../../extractor/extractor/MessageExtractor.js';
import type {ExtractorConfig} from '../../extractor/types.js';
import type {TurbopackLoaderContext} from '../types.js';

// Module-level extractor instance for transformation caching.
// Note: Next.js/Turbopack may create multiple loader instances, but each
// only handles file transformation. The ExtractionCompiler (which manages
// catalogs) is initialized separately in createNextIntlPlugin.
let extractor: MessageExtractor | undefined;

export default function extractionLoader(
  this: TurbopackLoaderContext<ExtractorConfig>,
  source: string
) {
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

  extractor
    .extract(this.resourcePath, source)
    .then((result) => {
      callback(null, result.code, result.map);
    })
    .catch(callback);
}

import type {ExtractorConfig} from '../../extractor/types.js';
import type {TurbopackLoaderContext} from '../types.js';
import SourceTransformer from './SourceTransformer.js';

// Module-level instance for transformation caching.
// Note: Next.js/Turbopack may create multiple loader instances, but each
// only handles file transformation. The ExtractionCompiler (which manages
// catalogs) is initialized separately in createNextIntlPlugin.
let transformer: SourceTransformer | undefined;

export default function extractionLoader(
  this: TurbopackLoaderContext<ExtractorConfig>,
  source: string
) {
  const callback = this.async();
  const projectRoot = this.rootContext;

  // Avoid rollup's `replace` plugin to compile this away
  const isDevelopment = process.env['NODE_ENV'.trim()] === 'development';

  if (!transformer) {
    transformer = new SourceTransformer({
      isDevelopment,
      projectRoot,
      sourceMap: this.sourceMap
    });
  }

  transformer
    .transform(this.resourcePath, source)
    .then((result) => {
      // Webpack loaders conventionally pass source maps as objects (e.g.
      // `next-swc-loader` calls `JSON.stringify` on its input source map)
      callback(
        null,
        result.code,
        result.map ? JSON.parse(result.map) : undefined
      );
    })
    .catch(callback);
}

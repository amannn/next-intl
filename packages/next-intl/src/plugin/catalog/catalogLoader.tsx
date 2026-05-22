import {type CatalogLoaderConfig} from 'intl-extractor';
import {precompileCatalog} from 'intl-extractor/compile-catalog';
import type {TurbopackLoaderContext} from '../types.js';

/**
 * Parses and optimizes catalog files.
 *
 * Note that if we use a dynamic import like `import(`${locale}.json`)`, then
 * the loader will optimistically run for all candidates in this folder (both
 * during dev as well as at build time).
 */
export default function catalogLoader(
  this: TurbopackLoaderContext<CatalogLoaderConfig>,
  source: string
) {
  const options = this.getOptions();
  const callback = this.async();

  precompileCatalog(source, {
    messages: {
      format: options.messages.format,
      precompile: options.messages.precompile
    },
    resourcePath: this.resourcePath,
    projectRoot: this.rootContext
  })
    .then((result) => callback(null, result))
    .catch(callback);
}

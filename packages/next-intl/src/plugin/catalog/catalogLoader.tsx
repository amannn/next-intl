import path from 'path';
import type Formatter from '../../extractor/formatters/Formatter.js';
import formatters from '../../extractor/formatters/index.js';
import type {CatalogLoaderConfig} from '../../extractor/types.js';
import type {TurbopackLoaderContext} from '../types.js';

let cachedFormatter: Formatter | null = null;
async function getFormatter(options: CatalogLoaderConfig): Promise<Formatter> {
  if (!cachedFormatter) {
    const FormatterClass = (await formatters[options.messages.format]())
      .default;
    cachedFormatter = new FormatterClass();
  }
  return cachedFormatter;
}

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

  getFormatter(options)
    .then((formatter) => {
      const locale = path.basename(this.resourcePath, formatter.EXTENSION);
      const jsonString = formatter.toJSONString(source, {locale});

      // https://v8.dev/blog/cost-of-javascript-2019#json
      const result = `export default JSON.parse(${JSON.stringify(jsonString)});`;

      callback(null, result);
    })
    .catch(callback);
}

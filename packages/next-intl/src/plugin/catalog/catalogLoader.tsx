import path from 'path';
import type ExtractorCodec from '../../extractor/codecs/ExtractorCodec.js';
import {
  getFormatExtension,
  resolveCodec
} from '../../extractor/codecs/utils.js';
import type {CatalogLoaderConfig} from '../../extractor/types.js';
import type {TurbopackLoaderContext} from '../types.js';

let cachedCodec: ExtractorCodec | null = null;
async function getCodec(
  options: CatalogLoaderConfig,
  projectRoot: string
): Promise<ExtractorCodec> {
  if (!cachedCodec) {
    cachedCodec = await resolveCodec(options.messages.format, projectRoot);
  }
  return cachedCodec;
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
  const extension = getFormatExtension(options.messages.format);

  getCodec(options, this.rootContext)
    .then((codec) => {
      const locale = path.basename(this.resourcePath, extension);
      const jsonString = codec.toJSONString(source, {locale});

      // https://v8.dev/blog/cost-of-javascript-2019#json
      const result = `export default JSON.parse(${JSON.stringify(jsonString)});`;

      callback(null, result);
    })
    .catch(callback);
}

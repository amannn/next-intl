import path from 'path';
import type Codec from '../../extractor/codecs/Codec.js';
import codecs from '../../extractor/codecs/index.js';
import type {CatalogLoaderConfig} from '../../extractor/types.js';
import type {TurbopackLoaderContext} from '../types.js';

let cachedCodec: Codec | null = null;
async function getCodec(options: CatalogLoaderConfig): Promise<Codec> {
  if (!cachedCodec) {
    const CodecClass = (
      await codecs[options.messages.codec as keyof typeof codecs]()
    ).default;
    cachedCodec = new CodecClass();
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

  getCodec(options)
    .then((codec) => {
      const locale = path.basename(this.resourcePath, codec.EXTENSION);
      const jsonString = codec.toJSONString(source, {locale});

      // https://v8.dev/blog/cost-of-javascript-2019#json
      const result = `export default JSON.parse(${JSON.stringify(jsonString)});`;

      callback(null, result);
    })
    .catch(callback);
}

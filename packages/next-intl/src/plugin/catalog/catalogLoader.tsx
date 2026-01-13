import compile from 'icu-minify/compiler';
import path from 'path';
import type ExtractorCodec from '../../extractor/format/ExtractorCodec.js';
import {
  getFormatExtension,
  resolveCodec
} from '../../extractor/format/index.js';
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
 * Recursively precompiles all ICU message strings in a messages object
 * using icu-minify/compiler for smaller runtime bundles.
 */
function precompileMessages(messages: unknown): unknown {
  if (typeof messages === 'string') {
    return compile(messages);
  }

  if (Array.isArray(messages)) {
    return messages.map((item) => precompileMessages(item));
  }

  if (messages !== null && typeof messages === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(messages)) {
      result[key] = precompileMessages(value);
    }
    return result;
  }

  return messages;
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

      let outputString: string;

      if (options.messages.precompile) {
        // Precompile ICU messages at build time for smaller runtime bundles
        const messages = JSON.parse(jsonString);
        const precompiled = precompileMessages(messages);
        outputString = JSON.stringify(precompiled);
      } else {
        outputString = jsonString;
      }

      // https://v8.dev/blog/cost-of-javascript-2019#json
      const result = `export default JSON.parse(${JSON.stringify(outputString)});`;

      callback(null, result);
    })
    .catch(callback);
}

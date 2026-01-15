import path from 'path';
import compile from 'icu-minify/compiler';
import type ExtractorCodec from '../../extractor/format/ExtractorCodec.js';
import {
  getFormatExtension,
  resolveCodec
} from '../../extractor/format/index.js';
import type {
  CatalogLoaderConfig,
  ExtractorMessage
} from '../../extractor/types.js';
import {setNestedProperty} from '../../extractor/utils.js';
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
      let outputString: string;

      if (options.messages.precompile) {
        const decoded = codec.decode(source, {locale});
        const precompiled = precompileMessages(decoded);
        outputString = JSON.stringify(precompiled);
      } else {
        outputString = codec.toJSONString(source, {locale});
      }

      // https://v8.dev/blog/cost-of-javascript-2019#json
      const result = `export default JSON.parse(${JSON.stringify(outputString)});`;

      callback(null, result);
    })
    .catch(callback);
}

/**
 * Recursively precompiles all ICU message strings in a messages object
 * using icu-minify/compiler for smaller runtime bundles.
 */
function precompileMessages(
  messages: Array<ExtractorMessage>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const message of messages) {
    const messageValue = message.message;

    if (Array.isArray(messageValue)) {
      throw new Error(
        `Message at \`${message.id}\` resolved to an array, but only strings are supported. See https://next-intl.dev/docs/usage/translations#arrays-of-messages`
      );
    }

    if (typeof messageValue === 'object') {
      throw new Error(
        `Message at \`${message.id}\` resolved to ${typeof messageValue}, but only strings are supported. Use a \`.\` to retrieve nested messages. See https://next-intl.dev/docs/usage/translations#structuring-messages`
      );
    }

    const compiledMessage = compile(messageValue);
    setNestedProperty(result, message.id, compiledMessage);
  }

  return result;
}

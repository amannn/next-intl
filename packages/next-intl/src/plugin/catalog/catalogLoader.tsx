import path from 'path';
import type ExtractorCodec from '../../extractor/format/ExtractorCodec.js';
import {
  getFormatExtension,
  resolveCodec
} from '../../extractor/format/index.js';
import type {MessagesConfig} from '../../extractor/types.js';
import type {TurbopackLoaderContext} from '../types.js';
import extractMessages from './extractMessages.js';
import precompileMessages from './precompileMessages.js';

export type CatalogLoaderConfig = {
  messages: MessagesConfig;
  sourceLocale?: string;
  srcPaths?: Array<string>;
  tsconfigPath: string;
};

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
  const locale = path.basename(this.resourcePath, extension);
  const projectRoot = this.rootContext;

  Promise.resolve()
    .then(async () => {
      const codec = await getCodec(options, projectRoot);
      let contentToDecode = source;

      const runExtraction =
        options.sourceLocale &&
        options.srcPaths &&
        locale === options.sourceLocale;
      if (runExtraction) {
        for (const srcPath of options.srcPaths!) {
          this.addContextDependency(path.resolve(projectRoot, srcPath));
        }

        // Invalidate when catalogs are added/removed so getTargetLocales sees new files
        const messagesDir = path.resolve(projectRoot, options.messages.path);
        this.addContextDependency(messagesDir);

        const result = await extractMessages({
          messages: options.messages,
          sourceLocale: options.sourceLocale!,
          srcPaths: options.srcPaths!,
          tsconfigPath: options.tsconfigPath,
          codec,
          projectRoot
        });
        contentToDecode = result;
      }

      let outputString: string;
      if (options.messages.precompile) {
        outputString = precompileMessages(contentToDecode, {
          codec,
          locale,
          resourcePath: this.resourcePath
        });
      } else {
        outputString = codec.toJSONString(contentToDecode, {locale});
      }

      // https://v8.dev/blog/cost-of-javascript-2019#json
      const result = `export default JSON.parse(${JSON.stringify(outputString)});`;

      callback(null, result);
    })
    .catch(callback);
}

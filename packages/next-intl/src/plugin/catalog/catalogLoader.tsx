import path from 'path';
import ExtractionCompiler from '../../extractor/ExtractionCompiler.js';
import type ExtractorCodec from '../../extractor/format/ExtractorCodec.js';
import {
  getFormatExtension,
  resolveCodec
} from '../../extractor/format/index.js';
import type {MessagesConfig} from '../../extractor/types.js';
import Instrumentation from '../../instrumentation/index.js';
import {isDevelopment} from '../config.js';
import type {TurbopackLoaderContext} from '../types.js';
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

let compiler: ExtractionCompiler | null = null;

// Single-flight: coalesce concurrent extract() calls so multiple consumers
// (e.g. route segments) share one run. Edge case: if src changes during an
// in-flight extract, new requests await the old run and may get stale content
// until the next invalidation.
let pendingExtract: Promise<string> | null = null;

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
  using I = new Instrumentation();
  const resourceRelative = path.relative(projectRoot, this.resourcePath);

  Promise.resolve()
    .then(async () => {
      I.start(`[catalogLoader] ${resourceRelative}`);

      const codec = await getCodec(options, projectRoot);
      let contentToDecode = source;

      const shouldExtract =
        options.sourceLocale &&
        options.srcPaths &&
        locale === options.sourceLocale;
      if (shouldExtract) {
        for (const srcPath of options.srcPaths!) {
          this.addContextDependency(path.resolve(projectRoot, srcPath));
        }

        // Invalidate when catalogs are added/removed so `getTargetLocales` sees new files
        const messagesDir = path.resolve(projectRoot, options.messages.path);
        this.addContextDependency(messagesDir);

        if (!compiler) {
          compiler = new ExtractionCompiler({
            codec,
            isDevelopment,
            messages: options.messages,
            projectRoot,
            sourceLocale: options.sourceLocale!,
            srcPaths: options.srcPaths!,
            tsconfigPath: options.tsconfigPath
          });
        }

        if (pendingExtract) {
          contentToDecode = await pendingExtract;
        } else {
          pendingExtract = compiler.extract();
          try {
            contentToDecode = await pendingExtract;
          } finally {
            pendingExtract = null;
          }
        }
      }

      let outputString: string;
      if (options.messages.precompile) {
        const decoded = codec.decode(contentToDecode, {locale});
        I.start(`[precompileMessages] ${resourceRelative}`);
        outputString = precompileMessages(decoded, {
          resourcePath: this.resourcePath
        });
        I.end(
          `[precompileMessages] ${resourceRelative}`,
          `${decoded.length} messages precompiled`
        );
      } else {
        outputString = codec.toJSONString(contentToDecode, {locale});
      }

      I.end(`[catalogLoader] ${resourceRelative}`);

      // https://v8.dev/blog/cost-of-javascript-2019#json
      const result = `export default JSON.parse(${JSON.stringify(outputString)});`;

      callback(null, result);
    })
    .catch(callback);
}

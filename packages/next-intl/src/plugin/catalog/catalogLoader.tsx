import path from 'path';
import type Formatter from '../../extractor/formatters/Formatter.js';
import formatters from '../../extractor/formatters/index.js';
import type {CatalogLoaderConfig} from '../../extractor/types.js';
import {setNestedProperty} from '../../extractor/utils/ObjectUtils.js';
import type {TurbopackLoaderContext} from '../types.js';

const cwd = process.cwd();

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

  // Check if file is within `messagesPath`.
  // TODO: Remove this in favor of `conditions` in Next.js 16.
  const messagesPath = path.join(cwd, options.messages.path);
  const isWithinMessagesPath = !path
    .relative(messagesPath, this.resourcePath)
    .startsWith('..');
  if (!isWithinMessagesPath) return source;

  const callback = this.async();

  getFormatter(options)
    .then((formatter) => {
      const locale = path
        .basename(this.resourcePath)
        .slice(0, -formatter.EXTENSION.length);

      const messagesObject: Record<string, string> = {};
      for (const message of formatter.parse(source, {locale})) {
        setNestedProperty(messagesObject, message.id, message.message);
      }

      callback(
        null,
        `export default ${JSON.stringify(messagesObject, null, 2)};`
      );
    })
    .catch(callback);
}

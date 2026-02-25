import MessageExtractor from '../../extractor/extractor/MessageExtractor.js';
import type {ExtractorConfig} from '../../extractor/types.js';
import {isDevelopment} from '../config.js';
import type {TurbopackLoaderContext} from '../types.js';

let extractor: MessageExtractor | undefined;

export default function extractionLoader(
  this: TurbopackLoaderContext<ExtractorConfig>,
  source: string
) {
  const callback = this.async();

  if (!extractor) {
    extractor = new MessageExtractor({
      projectRoot: this.rootContext,
      sourceMap: this.sourceMap,
      isDevelopment
    });
  }

  extractor
    .extract(this.resourcePath, source)
    .then((result) => {
      callback(null, result.code, result.map);
    })
    .catch(callback);
}

import type {ExtractorConfig} from '../../extractor/types.js';
import FileScanner from '../../scanner/FileScanner.js';
import {isDevelopment} from '../config.js';
import type {TurbopackLoaderContext} from '../types.js';

let fileScanner: FileScanner | undefined;

export default function extractionLoader(
  this: TurbopackLoaderContext<ExtractorConfig>,
  source: string
) {
  const callback = this.async();

  if (!fileScanner) {
    fileScanner = new FileScanner({
      projectRoot: this.rootContext,
      sourceMap: this.sourceMap,
      isDevelopment
    });
  }

  fileScanner
    .scan(this.resourcePath, source)
    .then((result) => {
      callback(null, result.code, result.map);
    })
    .catch(callback);
}

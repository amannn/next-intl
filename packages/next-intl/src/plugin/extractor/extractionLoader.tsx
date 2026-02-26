import path from 'path';
import type {ExtractorConfig} from '../../extractor/types.js';
import {getInstrumentation} from '../../instrumentation/index.js';
import FileScanner from '../../scanner/FileScanner.js';
import {isDevelopment} from '../config.js';
import type {TurbopackLoaderContext} from '../types.js';

let fileScanner: FileScanner | undefined;

export default function extractionLoader(
  this: TurbopackLoaderContext<ExtractorConfig>,
  source: string
) {
  const callback = this.async();
  const projectRoot = this.rootContext;
  const I = getInstrumentation();
  const resourceRelative = path.relative(projectRoot, this.resourcePath);

  I.start(`[extractionLoader] ${resourceRelative}`);

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
      I.end(`[extractionLoader] ${resourceRelative}`);
      callback(null, result.code, result.map);
    })
    .catch((error) => {
      I.end(`[extractionLoader] ${resourceRelative}`);
      callback(error);
    });
}

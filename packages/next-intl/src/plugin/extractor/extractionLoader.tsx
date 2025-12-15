import ExtractionCompiler from '../../extractor/ExtractionCompiler.js';
import MessageExtractor from '../../extractor/extractor/MessageExtractor.js';
import type {ExtractorConfig} from '../../extractor/types.js';
import Logger from '../../extractor/utils/Logger.js';
import type {TurbopackLoaderContext} from '../types.js';

// This instance:
// - Remains available through HMR
// - Is the same across react-client and react-server
// - Is only lost when the dev server restarts (e.g. due to change to Next.js config)
let compiler: ExtractionCompiler | undefined;
let extractor: MessageExtractor | undefined;
let extractAllPromise: Promise<void> | undefined;
let logger: Logger | undefined;

export default function extractionLoader(
  this: TurbopackLoaderContext<ExtractorConfig>,
  source: string
) {
  const options = this.getOptions();
  const callback = this.async();
  const projectRoot = this.rootContext;

  // Avoid rollup's `replace` plugin to compile this away
  const isDevelopment = process.env['NODE_ENV'.trim()] === 'development';

  if (!logger && options.debugLog) {
    logger = new Logger(options.debugLog, projectRoot);
    void logger.info('ExtractionLoader logger initialized', {
      debugLog: options.debugLog,
      projectRoot,
      isDevelopment
    });
  }

  if (!extractor) {
    // This instance is shared with the compiler to enable caching
    // across code transformations and catalog extraction
    void logger?.info('Creating MessageExtractor instance');
    extractor = new MessageExtractor({
      isDevelopment,
      projectRoot,
      sourceMap: this.sourceMap,
      logger: logger?.createChild('MessageExtractor')
    });
  }

  if (!compiler) {
    void logger?.info('Creating ExtractionCompiler instance');
    compiler = new ExtractionCompiler(options, {
      isDevelopment,
      projectRoot,
      sourceMap: this.sourceMap,
      extractor,
      logger
    });
  }

  if (!extractAllPromise) {
    void logger?.info('Starting initial scan (extractAll)');
    const startTime = Date.now();
    extractAllPromise = compiler.extractAll().then(() => {
      const duration = Date.now() - startTime;
      void logger?.info('Initial scan completed', {durationMs: duration});
    });
  }

  void logger?.debug('Processing file', {resourcePath: this.resourcePath});
  const extractStartTime = Date.now();
  extractor
    .extract(this.resourcePath, source)
    .then(async (result) => {
      const extractDuration = Date.now() - extractStartTime;
      void logger?.debug('File extraction completed', {
        resourcePath: this.resourcePath,
        durationMs: extractDuration,
        messageCount: result.messages.length
      });
      if (!isDevelopment) {
        await extractAllPromise;
      }
      callback(null, result.code, result.map);
    })
    .catch((error) => {
      void logger?.error('File extraction failed', {
        resourcePath: this.resourcePath,
        error: String(error)
      });
      callback(error);
    });
}

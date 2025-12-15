import ExtractionCompiler from '../../extractor/ExtractionCompiler.js';
import type {ExtractorConfig} from '../../extractor/types.js';
import Logger from '../../extractor/utils/Logger.js';
import type {PluginConfig} from '../types.js';
import {once} from '../utils.js';

// Single compiler instance, initialized once per process
let compiler: ExtractionCompiler | undefined;

const runOnce = once('_NEXT_INTL_EXTRACT');

export default function initExtractionCompiler(pluginConfig: PluginConfig) {
  const experimental = pluginConfig.experimental;
  if (!experimental?.extract) {
    return;
  }

  runOnce(() => {
    // Avoid rollup's `replace` plugin to compile this away
    const isDevelopment = process.env['NODE_ENV'.trim()] === 'development';

    const extractorConfig: ExtractorConfig = {
      srcPath: experimental.srcPath!,
      sourceLocale: experimental.extract!.sourceLocale,
      messages: experimental.messages!,
      ...(experimental.debugLog && {debugLog: experimental.debugLog})
    };

    const logger = experimental.debugLog
      ? new Logger(experimental.debugLog, process.cwd())
      : undefined;

    void logger?.info('Creating ExtractionCompiler instance (plugin level)', {
      isDevelopment
    });

    compiler = new ExtractionCompiler(extractorConfig, {
      isDevelopment,
      projectRoot: process.cwd(),
      logger
    });

    void logger?.info('Starting initial scan (extractAll)');
    const startTime = Date.now();

    // Fire-and-forget: Start extraction, don't block config return.
    // In dev mode, this also starts the file watcher.
    compiler.extractAll().then(
      () => {
        const duration = Date.now() - startTime;
        void logger?.info('Initial scan completed', {durationMs: duration});
      },
      (error) => {
        void logger?.error('Initial scan failed', {error: String(error)});
      }
    );

    // Cleanup on process exit
    function cleanup() {
      if (compiler) {
        compiler[Symbol.dispose]();
        compiler = undefined;
      }
    }
    process.on('exit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  });
}

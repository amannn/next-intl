import ExtractionCompiler from '../../extractor/ExtractionCompiler.js';
import type {ExtractorConfig} from '../../extractor/types.js';
import {isDevelopment, isNextBuild} from '../config.js';
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

  // Avoid running for:
  // - info
  // - start
  // - typegen
  //
  // Doesn't consult Next.js config anyway:
  // - telemetry
  // - lint
  //
  // What remains are:
  // - dev (NODE_ENV=development)
  // - build (NODE_ENV=production)
  const shouldRun = isDevelopment || isNextBuild;
  if (!shouldRun) return;

  runOnce(() => {
    const extractorConfig: ExtractorConfig = {
      srcPath: experimental.srcPath!,
      sourceLocale: experimental.extract!.sourceLocale,
      messages: experimental.messages!
    };

    compiler = new ExtractionCompiler(extractorConfig, {
      isDevelopment,
      projectRoot: process.cwd()
    });

    // Fire-and-forget: Start extraction, don't block config return.
    // In dev mode, this also starts the file watcher.
    // In prod, ideally we would wait until the extraction is complete,
    // but we can't `await` anywhere (at least for Turbopack).
    // The result is ok though, as if we encounter untranslated messages,
    // we'll simply add empty messages to the catalog. So for actually
    // running the app, there is no difference.
    compiler.extractAll();

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

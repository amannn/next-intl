import {
  ExtractionCompiler,
  type ExtractorConfig,
  hasLocalesToExtract
} from 'intl-extractor';
import {isDevelopment, isNextBuild} from '../config.js';
import {once} from '../utils.js';

// Single compiler instance, initialized once per process
let compiler: ExtractionCompiler | undefined;

const runOnce = once('_NEXT_INTL_EXTRACT');

export default function initExtractionCompiler(
  extractorConfig?: ExtractorConfig
) {
  if (!extractorConfig || !hasLocalesToExtract(extractorConfig)) {
    return;
  }

  // Avoid running for:
  // - info
  // - start
  // - typegen
  //
  // Doesn't consult Next.js config anyway:
  // - lint
  // - telemetry (however, the `detached-flush` DOES - see `createNextIntlPlugin`)
  //
  // What remains are:
  // - dev (NODE_ENV=development)
  // - build (NODE_ENV=production)
  const shouldRun = isDevelopment || isNextBuild;
  if (!shouldRun) return;

  runOnce(() => {
    compiler = new ExtractionCompiler(extractorConfig, {
      isDevelopment,
      projectRoot: process.cwd(),
      ...(extractorConfig.referenceRoot != null && {
        referenceRoot: extractorConfig.referenceRoot
      })
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

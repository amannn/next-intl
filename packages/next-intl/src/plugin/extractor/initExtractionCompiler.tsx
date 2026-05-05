import ExtractionCompiler from '../../extractor/ExtractionCompiler.js';
import type {ExtractorConfig} from '../../extractor/types.js';
import {isDevelopment, isNextBuild} from '../config.js';
import {once} from '../utils.js';

// Single compiler instance, initialized once per process
let compiler: ExtractionCompiler | undefined;

const runOnce = once('_NEXT_INTL_EXTRACT');

/**
 * Next runs `telemetry/detached-flush.js` in a detached process to flush telemetry
 * (often when `next dev` exits). That loads dev `next.config` with inherited
 * `NODE_ENV=development`, which would otherwise start orphan extract watchers.
 */
function isNextTelemetryDetachedFlushProcess(): boolean {
  const scriptPath = process.argv[1];
  if (!scriptPath) {
    return false;
  }
  const normalized = scriptPath.replace(/\\/g, '/');
  return normalized.includes('/telemetry/detached-flush');
}

export default function initExtractionCompiler(
  extractorConfig?: ExtractorConfig
) {
  if (!extractorConfig) {
    return;
  }

  if (isNextTelemetryDetachedFlushProcess()) {
    return;
  }

  // Avoid running for:
  // - info
  // - start
  // - typegen
  //
  // Telemetry `detached-flush` is skipped above (still loads this config, but in a new process).
  //
  // Doesn't consult Next.js config anyway:
  // - lint
  //
  // What remains are:
  // - dev (NODE_ENV=development)
  // - build (NODE_ENV=production)
  const shouldRun = isDevelopment || isNextBuild;
  if (!shouldRun) return;

  runOnce(() => {
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

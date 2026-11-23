import {extractMessages} from '@eloqnt/extractor/_internal';
import type {ExtractorConfig} from '../../extractor/types.js';
import {hasLocalesToExtract} from '../../extractor/utils.js';
import {isDevelopment, isNextBuild} from '../config.js';
import prefixUserError from '../prefixUserError.js';
import {formatMessage, once, warn} from '../utils.js';
import ExtractionCompiler from './ExtractionCompiler.js';
import SourceFileWatcher from './SourceFileWatcher.js';

// Single compiler instance, initialized once per process
let compiler: ExtractionCompiler | undefined;
let watcher: SourceFileWatcher | undefined;

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
    const projectRoot = process.cwd();
    let extraction: Promise<void>;
    if (isDevelopment) {
      const target = new ExtractionCompiler(extractorConfig, {
        projectRoot,
        warn
      });
      compiler = target;

      watcher = new SourceFileWatcher(target.getSrcPaths(), (events) =>
        target.update(events).catch((error) => {
          throw prefixUserError(error);
        })
      );
      // The watcher loads lazily, so waiting for its subscription keeps it
      // ahead of the initial scan and changes during the scan are picked up
      // (the compiler processes them once the scan is done)
      const watcherReady = watcher.start().catch((error: unknown) => {
        console.error(error);
      });

      extraction = watcherReady.then(() => target.extractAll());
    } else {
      extraction = extractMessages(extractorConfig, {projectRoot, warn}).then(
        () => {}
      );
    }

    // Fire-and-forget: Start extraction, don't block config return.
    // In prod, ideally we would wait until the extraction is complete,
    // but we can't `await` anywhere (at least for Turbopack).
    // The result is ok though, as if we encounter untranslated messages,
    // we'll simply add empty messages to the catalog. So for actually
    // running the app, there is no difference.
    if (isNextBuild) {
      // Next.js exits with 0 once the build is done, so failing loudly here is
      // the only way to keep a build from passing with outdated catalogs
      extraction.catch((error: unknown) => {
        console.error(
          formatMessage(error instanceof Error ? error.message : String(error))
        );
        process.exit(1);
      });
    } else {
      extraction.catch((error) => {
        throw prefixUserError(error);
      });
    }

    function cleanup() {
      if (watcher) {
        watcher[Symbol.dispose]();
        watcher = undefined;
      }
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

import {
  ExtractionCompiler,
  type ExtractorConfig,
  hasLocalesToExtract
} from 'intl-extractor';
import {once} from '../utils.js';

let compiler: ExtractionCompiler | undefined;

const runOnce = once('_EXPO_INTL_EXTRACT');

/**
 * Starts the message extraction watcher in the Metro host process.
 *
 * In dev: spawns a file watcher that updates message catalogs on save.
 * In production builds (`expo export`): runs a single extraction pass.
 *
 * Mirrors `next-intl/src/plugin/extractor/initExtractionCompiler.tsx` —
 * the file watcher is implemented in `intl-extractor` and is bundler
 * agnostic, so no Metro-specific wiring is needed here.
 */
export default function initExtractionCompiler(
  extractorConfig: ExtractorConfig | undefined,
  options: {
    readonly projectRoot: string;
    readonly referenceRoot?: string;
    readonly isDevelopment: boolean;
  }
): void {
  if (!extractorConfig || !hasLocalesToExtract(extractorConfig)) {
    return;
  }

  runOnce(() => {
    compiler = new ExtractionCompiler(extractorConfig, {
      isDevelopment: options.isDevelopment,
      projectRoot: options.projectRoot,
      ...(options.referenceRoot != null && {
        referenceRoot: options.referenceRoot
      })
    });

    // Fire-and-forget: don't block Metro config evaluation, but surface
    // failures so they don't become silent unhandled rejections.
    Promise.resolve(compiler.extractAll()).catch((error: unknown) => {
      console.error(
        `[expo-intl] extractAll() failed (projectRoot: ${options.projectRoot}):`,
        error
      );
    });

    function cleanup(): void {
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

import {createRequire} from 'module';
import path from 'path';
import LRUCache from './LRUCache.js';

const require = createRequire(import.meta.url);

/**
 * Compiles `useExtracted` and `getExtracted` calls for the bundler. The
 * messages themselves are extracted separately by `@eloqnt/extractor`.
 */
export default class SourceTransformer {
  private isDevelopment: boolean;
  private projectRoot: string;
  private sourceMap: boolean;
  private compileCache = new LRUCache<{code: string; map?: string}>(750);

  public constructor(opts: {
    isDevelopment: boolean;
    projectRoot: string;
    sourceMap?: boolean;
  }) {
    this.isDevelopment = opts.isDevelopment;
    this.projectRoot = opts.projectRoot;
    this.sourceMap = opts.sourceMap ?? false;
  }

  public async transform(
    absoluteFilePath: string,
    source: string
  ): Promise<{code: string; map?: string}> {
    const cacheKey = [source, absoluteFilePath].join('!');
    const cached = this.compileCache.get(cacheKey);
    if (cached) return cached;

    // Shortcut parsing if hook is not used. The Turbopack integration already
    // pre-filters this, but for webpack this feature doesn't exist, so we need
    // to do it here.
    if (!source.includes('useExtracted') && !source.includes('getExtracted')) {
      return {code: source};
    }

    // Load lazily so that importing the plugin doesn't require loading the
    // SWC native binding when no files use `useExtracted`.
    const {transform} = await import('@swc/core');

    const filePath = normalizePathToPosix(
      path.relative(this.projectRoot, absoluteFilePath)
    );
    const result = await transform(source, {
      jsc: {
        target: 'esnext',
        parser: {
          syntax: 'typescript',
          tsx: true,
          decorators: true
        },
        experimental: {
          cacheRoot: 'node_modules/.cache/swc',
          disableBuiltinTransformsForInternalTesting: true,
          disableAllLints: true,
          plugins: [
            [
              require.resolve('next-intl-swc-plugin-extractor'),
              {
                isDevelopment: this.isDevelopment,
                filePath
              }
            ]
          ]
        }
      },
      sourceMaps: this.sourceMap,
      // Is converted into a relative path by Next.js when
      // the final source map is generated
      sourceFileName: absoluteFilePath,
      filename: filePath
    });

    const transformResult = {code: result.code, map: result.map};
    this.compileCache.set(cacheKey, transformResult);
    return transformResult;
  }
}

// The plugin derives message references from this path, so keep it identical
// to `@eloqnt/extractor` regardless of the OS
function normalizePathToPosix(filePath: string): string {
  return path.posix.normalize(
    filePath.split(path.win32.sep).join(path.posix.sep)
  );
}

import {createRequire} from 'module';
import path from 'path';
import type {SourceExtractedMessage} from '../types.js';
import {getDefaultProjectRoot, normalizePathToPosix} from '../utils.js';

const require = createRequire(import.meta.url);

const TS_EXTENSIONS_WITHOUT_JSX = ['.ts', '.mts', '.cts'];

export default class MessageExtractor {
  private projectRoot: string;

  public constructor(opts: {projectRoot?: string} = {}) {
    this.projectRoot = opts.projectRoot ?? getDefaultProjectRoot();
  }

  public async extract(
    absoluteFilePath: string,
    source: string
  ): Promise<Array<SourceExtractedMessage>> {
    // Parsing is the expensive part, and only files with these calls have
    // messages
    if (!source.includes('useExtracted') && !source.includes('getExtracted')) {
      return [];
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
          // JSX would make `<T>(x: T) => x` and `<string>value` invalid, so
          // only enable it where it can occur
          tsx: !TS_EXTENSIONS_WITHOUT_JSX.includes(
            path.extname(absoluteFilePath)
          ),
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
                // Only changes the compiled code, not the messages
                isDevelopment: false,
                filePath
              }
            ]
          ]
        }
      },
      filename: filePath
    });

    // TODO: Improve the typing of @swc/core
    const output = (result as any).output as string;
    // The plugin emits a tagged union of extracted messages and
    // `useTranslations` usages; this extractor only consumes the former.
    return (
      JSON.parse(JSON.parse(output).results) as Array<
        {type: 'extracted' | 'translation'} & SourceExtractedMessage
      >
    )
      .filter((item) => item.type === 'extracted')
      .map((item) => ({
        id: item.id,
        message: item.message,
        description: item.description,
        reference: item.reference
      }));
  }
}

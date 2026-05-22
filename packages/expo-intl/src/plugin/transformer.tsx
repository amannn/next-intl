/**
 * Metro `babelTransformerPath` target. Chains the upstream Expo babel
 * transformer with two extra passes:
 *
 * 1. If the file is a source file containing a `useExtracted` /
 *    `getExtracted` call, run `MessageExtractor` (SWC plugin) on it to
 *    assign stable IDs and rewrite to `useTranslations` calls.
 * 2. If the file is a catalog file (`.po` / `.json` inside the configured
 *    `messages.path`), run `precompileCatalog` to emit a JS module that
 *    exports the precompiled ICU messages.
 *
 * Built as CJS so Metro can `require()` it directly. Reads its config from
 * `process.env._EXPO_INTL_TRANSFORMER_OPTIONS` because Metro spawns workers
 * that don't share closures with the host process.
 */

import path from 'path';
import {MessageExtractor} from 'intl-extractor';
import {precompileCatalog} from 'intl-extractor/compile-catalog';
import type {SerializedTransformerOptions} from './types.js';

// Imported via subpath; resolved by Metro/Node at runtime.
// Namespace import so the CJS module.exports shape is preserved.
import * as upstream from '@expo/metro-config/babel-transformer';

interface MetroTransformInput {
  readonly src: string;
  readonly filename: string;
  readonly options: {
    readonly sourceMap?: boolean;
    readonly [key: string]: unknown;
  };
}

interface MetroTransformResult {
  readonly ast?: unknown;
  readonly code?: string;
  readonly map?: unknown;
}

const ENV_VAR = '_EXPO_INTL_TRANSFORMER_OPTIONS';
const SOURCE_FILE_REGEX = /\.(?:tsx?|jsx?|mjs|cjs)$/;
const NEEDLE_REGEX = /(?:useExtracted|getExtracted)/;

let cachedOptions: SerializedTransformerOptions | null = null;
let cachedExtractor: MessageExtractor | undefined;

function getOptions(): SerializedTransformerOptions | null {
  if (cachedOptions !== null) return cachedOptions;
  const raw = process.env[ENV_VAR];
  if (!raw) return null;
  try {
    cachedOptions = JSON.parse(raw) as SerializedTransformerOptions;
    return cachedOptions;
  } catch {
    return null;
  }
}

function normalizeDottedExtension(extension: unknown): `.${string}` {
  if (typeof extension !== 'string' || extension.length === 0) {
    throw new Error(
      `[expo-intl] customFormat.extension must be a non-empty string (got ${String(extension)}).`
    );
  }
  return (extension.startsWith('.') ? extension : `.${extension}`) as `.${string}`;
}

function isCatalogPath(
  filename: string,
  options: SerializedTransformerOptions
): boolean {
  if (!filename.endsWith(options.extension)) return false;
  const normalized = path.resolve(filename);
  return options.messagesPaths.some((messagesPath) => {
    const root = path.resolve(messagesPath);
    return normalized === root || normalized.startsWith(root + path.sep);
  });
}

export async function transform(
  input: MetroTransformInput
): Promise<MetroTransformResult> {
  const options = getOptions();
  if (!options) {
    return upstream.transform(input);
  }

  // 1) Catalog file → precompile to an ES module via the shared helper.
  if (isCatalogPath(input.filename, options)) {
    const messages = options.customFormat
      ? {
          format: {
            codec: options.customFormat.codec,
            extension: normalizeDottedExtension(
              options.customFormat.extension
            )
          },
          precompile: options.precompile
        }
      : {
          format: options.format as 'po' | 'json',
          precompile: options.precompile
        };

    const compiledSource = await precompileCatalog(input.src, {
      messages,
      resourcePath: input.filename,
      projectRoot: options.projectRoot
    });

    return upstream.transform({
      ...input,
      src: compiledSource
    });
  }

  // 2) Source file with useExtracted/getExtracted → run SWC plugin.
  if (
    options.extract &&
    SOURCE_FILE_REGEX.test(input.filename) &&
    NEEDLE_REGEX.test(input.src)
  ) {
    cachedExtractor ??= new MessageExtractor({
      isDevelopment: options.isDevelopment,
      projectRoot: options.projectRoot,
      ...(options.referenceRoot != null && {
        referenceRoot: options.referenceRoot
      }),
      sourceMap: input.options.sourceMap === true
    });

    const result = await cachedExtractor.extract(input.filename, input.src);
    return upstream.transform({
      ...input,
      src: result.code
    });
  }

  // Default: pass-through.
  return upstream.transform(input);
}

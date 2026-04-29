import {throwError} from '../plugin/utils.js';
import type {MessagesFormat} from './format/types.js';
import type {ExtractorConfig, Locale} from './types.js';

function stripTrailingSlash(dirPath: string): string {
  return dirPath.replace(/\/+$/, '');
}

export type ExtractorInput = {
  srcPath: string | Array<string>;
  sourceLocale: string;
  messages: {
    path: string | Array<string>;
    format: MessagesFormat;
    /** @deprecated Use `extract.locales` instead. */
    locales?: 'infer' | ReadonlyArray<Locale>;
    precompile?: boolean;
  };
  extract?: {
    path?: string;
    locales?: 'infer' | ReadonlyArray<Locale>;
  };
};

export type NormalizeExtractorOptions = {
  warnLocalesDeprecation?(): void;
};

export default function normalizeExtractorConfig(
  input: ExtractorInput,
  options?: NormalizeExtractorOptions
): ExtractorConfig {
  if (input.extract?.locales != null && input.messages.locales != null) {
    throwError(
      'Use either `extract.locales` or `messages.locales`, not both. Prefer `extract.locales`.'
    );
  }

  const locales = input.extract?.locales ?? input.messages.locales;
  if (locales == null) {
    throwError(
      '`extract.locales` is required when extracting messages (or pass legacy `messages.locales`).'
    );
  }

  if (input.messages.locales != null) {
    options?.warnLocalesDeprecation?.();
  }

  const messagePath = input.messages.path;
  const pathIsArray = Array.isArray(messagePath);
  const rawPaths: Array<string> = pathIsArray ? messagePath : [messagePath];
  const loadPaths = rawPaths
    .map((dirPath) => stripTrailingSlash(String(dirPath).trim()))
    .filter((dirPath) => dirPath.length > 0);
  if (loadPaths.length === 0) {
    throwError('`messages.path` must not be empty.');
  }

  let catalogPath: string;
  if (input.extract?.path != null) {
    catalogPath = stripTrailingSlash(String(input.extract.path).trim());
    if (!catalogPath) {
      throwError('`extract.path` must be a non-empty string.');
    }
  } else {
    if (pathIsArray) {
      throwError(
        'When `messages.path` is an array, `extract.path` is required to select the writable catalog directory.'
      );
    }
    catalogPath = loadPaths[0]!;
  }

  return {
    srcPath: input.srcPath,
    sourceLocale: input.sourceLocale,
    catalogPath,
    locales,
    messages: {
      format: input.messages.format,
      ...(input.messages.precompile !== undefined && {
        precompile: input.messages.precompile
      })
    }
  };
}

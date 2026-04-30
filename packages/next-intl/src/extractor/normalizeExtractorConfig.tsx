import {throwError, warn} from '../plugin/utils.js';
import type {MessagesFormat} from './format/types.js';
import type {ExtractorConfig, Locale} from './types.js';

function stripTrailingSlash(dirPath: string): string {
  return dirPath.replace(/\/+$/, '');
}

export type ExtractorInput = {
  srcPath: string | Array<string>;
  /**
   * @deprecated Use `extract.sourceLocale`
   */
  sourceLocale?: string;
  messages: {
    path: string | Array<string>;
    format: MessagesFormat;
    /** @deprecated Use `extract.locales` instead. */
    locales?: 'infer' | ReadonlyArray<Locale>;
  };
  extract?: {
    sourceLocale?: string;
    path?: string;
    locales?: 'infer' | ReadonlyArray<Locale>;
  };
};

export default function normalizeExtractorConfig(
  input: ExtractorInput
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
    warn(
      '`messages.locales` is deprecated. Prefer `extract.locales` (`experimental.extract.locales` alongside `experimental.extract.sourceLocale` when using createNextIntlPlugin).'
    );
  }

  const sourceLocale: string | undefined =
    input.extract?.sourceLocale ?? input.sourceLocale;

  const hasRootLocale = input.sourceLocale != null;
  const hasNestedLocale = input.extract?.sourceLocale != null;
  if (hasRootLocale && hasNestedLocale) {
    if (input.extract!.sourceLocale !== input.sourceLocale) {
      throwError(
        'Conflicting `sourceLocale` and `extract.sourceLocale` — specify only `extract.sourceLocale`.'
      );
    }
  }

  const resolvedSourceLocale = sourceLocale?.trim();

  if (resolvedSourceLocale == null || resolvedSourceLocale === '') {
    throwError(
      '`extract.sourceLocale` is required (same nesting as experimental.extract.sourceLocale next to experimental.messages and experimental.srcPath when using createNextIntlPlugin). Legacy root-level sourceLocale remains supported temporarily.'
    );
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
    sourceLocale: resolvedSourceLocale,
    catalogPath,
    locales,
    messages: {
      format: input.messages.format
    }
  };
}

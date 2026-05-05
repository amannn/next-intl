import {throwError, warn} from '../plugin/utils.js';
import type {ExtractorConfig, ExtractorConfigInput} from './types.js';

function stripTrailingSlash(dirPath: string): string {
  return dirPath.replace(/\/+$/, '');
}

export function normalizeMessagesCatalogPaths(
  messagesPath: string | Array<string>
): Array<string> {
  const rawPaths = Array.isArray(messagesPath) ? messagesPath : [messagesPath];
  return rawPaths
    .map((dirPath) => stripTrailingSlash(String(dirPath).trim()))
    .filter((dirPath) => dirPath.length > 0);
}

export default function normalizeExtractorConfig(
  input: ExtractorConfigInput
): ExtractorConfig {
  if (input.extract?.locales != null && input.messages.locales != null) {
    throwError(
      'Use either `extract.locales` or `messages.locales`, not both. Prefer `extract.locales`.'
    );
  }

  const locales = input.extract?.locales ?? input.messages.locales;
  if (locales == null) {
    throwError('`extract.locales` is required when extracting messages.');
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

  if (input.sourceLocale != null && input.extract?.sourceLocale == null) {
    warn(
      'Root-level `sourceLocale` is deprecated in favor of `extract.sourceLocale`.'
    );
  }

  const resolvedSourceLocale = sourceLocale?.trim();

  if (resolvedSourceLocale == null || resolvedSourceLocale === '') {
    throwError('`extract.sourceLocale` is required.');
  }

  const pathIsArray = Array.isArray(input.messages.path);
  const messagesPath = normalizeMessagesCatalogPaths(input.messages.path);
  if (messagesPath.length === 0) {
    throwError('`messages.path` must not be empty.');
  }

  let extractPath: string;
  if (input.extract?.path != null) {
    extractPath = stripTrailingSlash(String(input.extract.path).trim());
    if (!extractPath) {
      throwError('`extract.path` must be a non-empty string.');
    }
  } else {
    if (pathIsArray) {
      throwError(
        'When `messages.path` is an array, `extract.path` is required to select the writable catalog directory.'
      );
    }
    extractPath = messagesPath[0]!;
  }

  return {
    extract: {
      locales,
      path: extractPath,
      sourceLocale: resolvedSourceLocale
    },
    messages: {
      format: input.messages.format,
      path: messagesPath
    },
    srcPath: input.srcPath
  };
}

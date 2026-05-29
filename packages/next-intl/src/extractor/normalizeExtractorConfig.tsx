import {throwError, warn} from '../plugin/utils.js';
import type {ExtractorConfig, ExtractorConfigInput} from './types.js';

function stripTrailingSlash(dirPath: string): string {
  if (dirPath.endsWith('/')) {
    return dirPath.slice(0, -1);
  } else {
    return dirPath;
  }
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
  input: Omit<ExtractorConfigInput, 'messages'> & {
    messages?: ExtractorConfigInput['messages'];
  }
): ExtractorConfig {
  if (input.messages == null) {
    throwError('`messages` is required when extracting messages.');
  }

  const extract = input.extract;

  let extractPath: string | undefined;
  let sourceLocale: string | undefined;

  if (extract !== undefined && extract !== true) {
    if (extract.sourceLocale) {
      warn(
        '`extract.sourceLocale` is deprecated in favor of `messages.sourceLocale`.'
      );
      sourceLocale = extract.sourceLocale;
    }

    if (extract.path) {
      extractPath = stripTrailingSlash(extract.path);
    }
  }

  const locales = input.messages.locales;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!locales) {
    throwError('`messages.locales` is required when extracting messages.');
  }

  if (input.messages.sourceLocale) {
    sourceLocale = input.messages.sourceLocale;
  }

  if (!sourceLocale) {
    throwError('`messages.sourceLocale` is required when extracting messages.');
  }

  const srcPath = input.srcPath;
  if (srcPath == null) {
    throwError('`srcPath` is required when extracting messages.');
  }

  const pathIsArray = Array.isArray(input.messages.path);
  const messagesPath = normalizeMessagesCatalogPaths(input.messages.path);
  if (messagesPath.length === 0) {
    throwError('`messages.path` must not be empty.');
  }

  if (extractPath == null) {
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
      sourceLocale,
      srcPath
    },
    messages: {
      format: input.messages.format,
      path: messagesPath
    }
  };
}

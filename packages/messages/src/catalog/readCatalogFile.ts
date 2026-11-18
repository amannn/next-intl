import fs from 'fs/promises';
import path from 'path';
import UserError, {type UserErrorCode} from '../UserError.js';
import type {Locale} from '../types.js';
import {addNamespacePrefix} from './namespacePrefix.js';
import type {Catalog, SeparateFileCodec} from './types.js';

/**
 * `undefined` when the file doesn't exist, so callers can decide whether
 * that's an error (source) or an empty catalog (target).
 */
export default async function readCatalogFile(input: {
  filePath: string;
  locale: Locale;
  sourceLocale: Locale;
  codec: SeparateFileCodec;
  namespace: string | undefined;
}): Promise<Catalog | undefined> {
  const {filePath, locale, sourceLocale, codec, namespace} = input;
  const content = await readIfExists(filePath);
  if (content === undefined) return undefined;

  let messages;
  try {
    messages = codec.decode(content, {locale, sourceLocale});
  } catch (error) {
    throw toDecodeError(error, filePath);
  }
  return {
    locale,
    file: filePath,
    messages: addNamespacePrefix(messages, namespace),
    codec
  };
}

export async function readIfExists(
  filePath: string
): Promise<string | undefined> {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

/**
 * A codec error that carries a hint already knows how to fix the problem, so
 * it's kept. Anything else is a parse failure, where the file needs fixing.
 */
export function toDecodeError(error: unknown, filePath: string): UserError {
  const details = path.relative(process.cwd(), filePath);
  const {code, hint, message} = error as Partial<UserError>;
  if (typeof hint === 'string') {
    return new UserError(String(message), {
      code: code as UserErrorCode | undefined,
      details,
      hint
    });
  }
  return new UserError(String(message ?? error), {
    code: 'MALFORMED_CATALOG',
    details,
    hint: 'Fix the file so it parses, then run the command again.'
  });
}

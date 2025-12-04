import path from 'path';
import {throwError} from '../../plugin/utils.js';
import type {ExtractorMessage} from '../types.js';
import {localeCompare} from '../utils.js';
import type ExtractorCodec from './ExtractorCodec.js';
import type {BuiltInMessagesFormat, MessagesFormat} from './types.js';
import formats from './index.js';

export function getSortedMessages(
  messages: Array<ExtractorMessage>
): Array<ExtractorMessage> {
  return messages.toSorted((messageA, messageB) => {
    const pathA = messageA.references?.[0]?.path ?? '';
    const pathB = messageB.references?.[0]?.path ?? '';

    if (pathA === pathB) {
      return localeCompare(messageA.id, messageB.id);
    } else {
      return localeCompare(pathA, pathB);
    }
  });
}

export function isBuiltInFormat(
  format: MessagesFormat
): format is BuiltInMessagesFormat {
  return typeof format === 'string' && format in formats;
}

export function getFormatExtension(format: MessagesFormat): string {
  if (isBuiltInFormat(format)) {
    return formats[format].extension;
  } else {
    return format.extension;
  }
}

export async function resolveCodec(
  format: MessagesFormat,
  projectRoot: string
): Promise<ExtractorCodec> {
  if (isBuiltInFormat(format)) {
    const CodecClass = (await formats[format].Codec()).default;
    return new CodecClass();
  }

  const resolvedPath = path.isAbsolute(format.codec)
    ? format.codec
    : path.resolve(projectRoot, format.codec);

  let module;
  try {
    module = await import(resolvedPath);
  } catch (error) {
    throwError(`Could not load codec from "${resolvedPath}".\n${error}`);
  }

  const CodecClass = module.default;

  if (!CodecClass || typeof CodecClass !== 'function') {
    throwError(`Codec at "${resolvedPath}" must export a default class.`);
  }

  return new CodecClass();
}

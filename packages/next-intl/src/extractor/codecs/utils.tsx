import {createRequire} from 'module';
import path from 'path';
import {throwError} from '../../plugin/utils.js';
import type {ExtractedMessage} from '../types.js';
import {localeCompare} from '../utils.js';
import ExtractorCodec from './ExtractorCodec.js';

export function getSortedMessages(
  messages: Array<ExtractedMessage>
): Array<ExtractedMessage> {
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

const builtInCodecs = {
  json: () => import('./JSONCodec.js'),
  po: () => import('./POCodec.js')
};

export function isBuiltInCodec(
  codec: string
): codec is keyof typeof builtInCodecs {
  return codec in builtInCodecs;
}

const builtInCodecExtensions: Record<keyof typeof builtInCodecs, string> = {
  json: 'json',
  po: 'po'
};

export function getCodecExtension(codec: string, projectRoot: string): string {
  if (isBuiltInCodec(codec)) {
    return builtInCodecExtensions[codec];
  }

  // For custom codecs, resolve the path and load synchronously using createRequire
  const resolvedPath = path.isAbsolute(codec)
    ? codec
    : path.resolve(projectRoot, codec);

  const require = createRequire(import.meta.url);
  const module = require(resolvedPath);
  const CodecClass = module.default || module;

  if (!CodecClass || typeof CodecClass !== 'function') {
    throwError(
      `Custom codec at "${resolvedPath}" must export a default class.`
    );
  }

  const instance = new CodecClass();
  const extension = instance.EXTENSION;

  if (
    !extension ||
    typeof extension !== 'string' ||
    !extension.startsWith('.')
  ) {
    throwError(
      `Custom codec at "${resolvedPath}" must have a valid EXTENSION property (e.g., '.json').`
    );
  }

  // Return without the leading dot for consistency with built-in codecs
  return extension.slice(1);
}

export async function resolveCodec(
  codec: string,
  projectRoot: string
): Promise<ExtractorCodec> {
  // Built-in codec
  if (isBuiltInCodec(codec)) {
    const CodecClass = (await builtInCodecs[codec]()).default;
    return new CodecClass();
  }

  // Custom codec (file path)
  const resolvedPath = path.isAbsolute(codec)
    ? codec
    : path.resolve(projectRoot, codec);

  let module;
  try {
    module = await import(resolvedPath);
  } catch {
    throwError(
      `Could not load custom codec from "${resolvedPath}". ` +
        `Make sure the file exists and exports a default class extending ExtractorCodec.`
    );
  }

  const CodecClass = module.default;

  if (!CodecClass || typeof CodecClass !== 'function') {
    throwError(
      `Custom codec at "${resolvedPath}" must export a default class.`
    );
  }

  const instance = new CodecClass();

  if (!(instance instanceof ExtractorCodec)) {
    throwError(
      `Custom codec at "${resolvedPath}" must extend the ExtractorCodec base class. ` +
        `Import it from 'next-intl/extractor'.`
    );
  }

  return instance;
}

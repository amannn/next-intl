import path from 'path';
import {throwError} from '../../plugin/utils.js';
import type ExtractorCodec from './ExtractorCodec.js';
import type {BuiltInMessagesFormat, MessagesFormat} from './types.js';

const formats = {
  json: {codec: () => import('./codecs/JSONCodec.js'), extension: '.json'},
  po: {codec: () => import('./codecs/POCodec.js'), extension: '.po'}
} satisfies Record<
  string,
  {
    codec(): Promise<{default(): ExtractorCodec}>;
    extension: `.${string}`;
  }
>;

export default formats;

function isBuiltInFormat(
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
    const factory = (await formats[format].codec()).default;
    return factory();
  } else {
    const resolvedPath = path.isAbsolute(format.codec)
      ? format.codec
      : path.resolve(projectRoot, format.codec);

    let module;
    try {
      module = await import(resolvedPath);
    } catch (error) {
      throwError(`Could not load codec from "${resolvedPath}".\n${error}`);
    }

    const factory = module.default;

    if (!factory || typeof factory !== 'function') {
      throwError(
        `Codec at "${resolvedPath}" must have a default export returned from \`defineCodec\`.`
      );
    }

    return factory();
  }
}

import {createRequire} from 'module';
import path from 'path';
import {pathToFileURL} from 'url';
import {throwError} from '../../plugin/utils.js';
import type ExtractorCodec from './ExtractorCodec.js';
import type {BuiltInMessagesFormat, MessagesFormat} from './types.js';

const formats = {
  json: {codec: () => import('@eloqnt/format-json'), extension: '.json'},
  po: {codec: () => import('./codecs/BuiltInPoCodec.js'), extension: '.po'}
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
    // A codec that starts with `.` or a filesystem root is a file path;
    // everything else reads as a package specifier, mirroring how imports
    // distinguish the two. Packages resolve from the project's dependencies.
    const isPath =
      format.codec.startsWith('.') || path.isAbsolute(format.codec);
    let resolvedPath;
    if (isPath) {
      resolvedPath = path.resolve(projectRoot, format.codec);
    } else {
      try {
        resolvedPath = createRequire(path.join(projectRoot, 'noop.js')).resolve(
          format.codec
        );
      } catch (error) {
        throwError(
          `Could not resolve the codec package "${format.codec}". Is it installed?\n${error}`
        );
      }
    }

    let module;
    try {
      module = await import(pathToFileURL(resolvedPath).href);
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

import path from 'path';
import Codec from './Codec.js';

const builtInCodecs = {
  json: () => import('./JSONCodec.js'),
  po: () => import('./POCodec.js')
};

function isBuiltInCodec(codec: string): codec is keyof typeof builtInCodecs {
  return codec in builtInCodecs;
}

export default async function resolveCodec(
  codec: string,
  projectRoot: string
): Promise<Codec> {
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
  } catch (error) {
    throw new Error(
      `[next-intl] Could not load custom codec from "${resolvedPath}". ` +
        `Make sure the file exists and exports a default class extending Codec.`,
      {cause: error}
    );
  }

  const CodecClass = module.default;

  if (!CodecClass || typeof CodecClass !== 'function') {
    throw new Error(
      `[next-intl] Custom codec at "${resolvedPath}" must export a default class.`
    );
  }

  const instance = new CodecClass();

  if (!(instance instanceof Codec)) {
    throw new Error(
      `[next-intl] Custom codec at "${resolvedPath}" must extend the Codec base class. ` +
        `Import it from 'next-intl/codec'.`
    );
  }

  return instance;
}

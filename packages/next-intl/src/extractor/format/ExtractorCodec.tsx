import type {defineCodec as sharedDefineCodec} from '@eloqnt/config';
import type {Locale} from '../types.js';

// Derived from `@eloqnt/config`, so next-intl and eloqnt pass identical
// options to codecs.
type SeparateFileCodec = Extract<
  ReturnType<ReturnType<typeof sharedDefineCodec>>,
  {decode: unknown}
>;

export default interface ExtractorCodec extends SeparateFileCodec {
  /**
   * @deprecated No longer used. Catalogs are loaded into your application via
   * `decode`, so you can remove `toJSONString` from your codec. Providing it
   * logs a deprecation warning and has no effect.
   */
  toJSONString?(content: string, context: {locale: Locale}): string;
}

export function defineCodec(factory: () => ExtractorCodec) {
  return factory;
}

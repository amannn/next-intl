import type {SeparateFileCodec} from '@eloqnt/config';
import type {Locale} from '../types.js';

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

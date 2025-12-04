import type {MessagesCodec} from '../types.js';
import type ExtractorCodec from './ExtractorCodec.js';

const codecs = {
  json: () => import('./JSONCodec.js'),
  po: () => import('./POCodec.js')
} satisfies Record<
  Extract<MessagesCodec, 'json' | 'po'>,
  () => Promise<{default: new () => ExtractorCodec}>
>;

export default codecs;

// Re-export for public API
export {
  default as ExtractorCodec,
  type CodecContext
} from './ExtractorCodec.js';
export {default as resolveCodec, getCodecExtension} from './resolveCodec.js';

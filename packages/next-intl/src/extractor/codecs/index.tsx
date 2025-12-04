import type {MessagesCodec} from '../types.js';
import type Codec from './Codec.js';

const codecs = {
  json: () => import('./JSONCodec.js'),
  po: () => import('./POCodec.js')
} satisfies Record<
  Extract<MessagesCodec, 'json' | 'po'>,
  () => Promise<{default: new () => Codec}>
>;

export default codecs;

// Re-export for public API
export {default as Codec, type CodecContext} from './Codec.js';
export {default as resolveCodec} from './resolveCodec.js';

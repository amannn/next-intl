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

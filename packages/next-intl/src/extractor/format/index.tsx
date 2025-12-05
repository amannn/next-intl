import type ExtractorCodec from './ExtractorCodec.js';

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

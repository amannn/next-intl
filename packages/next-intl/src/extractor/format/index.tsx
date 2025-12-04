import type ExtractorCodec from './ExtractorCodec.js';

const formats = {
  json: {Codec: () => import('./codecs/JSONCodec.js'), extension: '.json'},
  po: {Codec: () => import('./codecs/POCodec.js'), extension: '.po'}
} satisfies Record<
  string,
  {
    Codec(): Promise<{default: new () => ExtractorCodec}>;
    extension: `.${string}`;
  }
>;

export default formats;

export type BuiltInFormat = keyof typeof formats;

export type CustomFormat = {
  codec: string;
  extension: `.${string}`;
};

export type MessagesFormat = BuiltInFormat | CustomFormat;

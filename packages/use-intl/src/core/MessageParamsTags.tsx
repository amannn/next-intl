import {ReactNode} from 'react';

export type RichTextFunction = (chunks: ReactNode) => ReactNode;
export type MarkupFunction = (chunks: string) => string;

export type ExtractTags<
  MessageString extends string,
  ChunksFn extends RichTextFunction | MarkupFunction
> = MessageString extends `${infer Prefix}<${infer TagName}>${infer Content}</${string}>${infer Tail}`
  ? Record<TagName, ChunksFn> &
      ExtractTags<`${Prefix}${Content}${Tail}`, ChunksFn>
  : {};

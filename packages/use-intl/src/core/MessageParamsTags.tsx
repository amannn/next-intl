import {ReactNode} from 'react';

export type RichTextFunction = (chunks: ReactNode) => ReactNode;
export type MarkupFunction = (chunks: string) => string;

export type ExtractTags<
  MessageString extends string,
  ChunksFn extends RichTextFunction | MarkupFunction
> = MessageString extends `${infer Pre}<${infer TagName}>${infer Content}</${string}>${infer Rest}`
  ? Record<TagName, ChunksFn> & ExtractTags<`${Pre}${Content}${Rest}`, ChunksFn>
  : {};

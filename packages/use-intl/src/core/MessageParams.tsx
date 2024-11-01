import {
  ExtractTags,
  MarkupFunction,
  RichTextFunction
} from './MessageParamsTags.tsx';
import MessageParamsValues from './MessageParamsValues.tsx';

export type MessageParams<
  MessageString extends string,
  ChunksFn extends RichTextFunction | MarkupFunction = never
> = MessageParamsValues<MessageString> &
  ([ChunksFn] extends [never] ? {} : ExtractTags<MessageString, ChunksFn>);

export type MessageParamsRichText<MessageString extends string> = MessageParams<
  MessageString,
  RichTextFunction
>;

export type MessageParamsMarkup<MessageString extends string> = MessageParams<
  MessageString,
  MarkupFunction
>;

import {ReactNode} from 'react';
import {PlainTranslationValue} from './TranslationValues.tsx';

type RichTextFunction = (chunks: ReactNode) => ReactNode;
type MarkupFunction = (chunks: string) => string;

type ExtractParams<MessageString extends string> =
  MessageString extends `${string}{${infer ParamName}}${infer RestOfMessage}`
    ? ParamName extends `${infer Name}, ${string}`
      ? Record<Name, InferParamType<`${string}`>> & ExtractParams<RestOfMessage>
      : Record<ParamName, PlainTranslationValue> & ExtractParams<RestOfMessage>
    : {};

type ExtractTags<MessageString extends string> =
  MessageString extends `${infer Pre}<${infer TagName}>${infer Content}</${string}>${infer RestOfMessage}`
    ? Record<TagName, RichTextFunction | MarkupFunction> &
        ExtractTags<`${Pre}${Content}${RestOfMessage}`>
    : {};

type InferParamType<FormatType extends string> =
  FormatType extends `plural, ${string}`
    ? number
    : FormatType extends `selectordinal, ${string}`
      ? number
      : FormatType extends `select, ${string}`
        ? string
        : PlainTranslationValue;

type MessageParams<MessageString extends string> =
  ExtractParams<MessageString> & ExtractTags<MessageString>;

export default MessageParams;

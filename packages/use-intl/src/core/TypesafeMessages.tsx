import {ReactNode} from 'react';

/**
 * Namespaces & keys
 */

export type NestedKeyOf<ObjectType> = ObjectType extends object
  ? {
      [Property in keyof ObjectType]:
        | `${Property & string}`
        | `${Property & string}.${NestedKeyOf<ObjectType[Property]>}`;
    }[keyof ObjectType]
  : never;

export type NestedValueOf<
  ObjectType,
  Path extends string
> = Path extends `${infer Cur}.${infer Rest}`
  ? Cur extends keyof ObjectType
    ? NestedValueOf<ObjectType[Cur], Rest>
    : never
  : Path extends keyof ObjectType
    ? ObjectType[Path]
    : never;

export type NamespaceKeys<ObjectType, AllKeys extends string> = {
  [PropertyPath in AllKeys]: NestedValueOf<
    ObjectType,
    PropertyPath
  > extends string
    ? never
    : PropertyPath;
}[AllKeys];

export type MessageKeys<ObjectType, AllKeys extends string> = {
  [PropertyPath in AllKeys]: NestedValueOf<
    ObjectType,
    PropertyPath
  > extends string
    ? PropertyPath
    : never;
}[AllKeys];

/**
 * Params
 */

type PlainParam = string | number;
type RichTextFunction = (chunks: ReactNode) => ReactNode;
type MarkupFunction = (chunks: string) => string;

type ExtractParams<MessageString extends string> =
  MessageString extends `${string}{${infer ParamName}}${infer RestOfMessage}`
    ? ParamName extends `${infer Name}, ${infer FormatType}`
      ? Record<Name, InferParamType<FormatType>> & ExtractParams<RestOfMessage>
      : Record<ParamName, PlainParam> & ExtractParams<RestOfMessage>
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
        : PlainParam;

export type MessageParams<MessageString extends string> =
  ExtractParams<MessageString> & ExtractTags<MessageString>;

import {PlainTranslationValue} from './TranslationValues.tsx';

type PluralValue =
  | `=${number}`
  | 'zero'
  | 'one'
  | 'two'
  | 'few'
  | 'many'
  | 'other';

type NumberFormatOption = string | `::${string}`;
type NumberFormat = 'number' | `number, ${NumberFormatOption}`;

type DateFormatOption = string | `::${string}`;
type DateFormat = 'date' | `date, ${DateFormatOption}`;

type ExtractParams<Value extends PlainTranslationValue> = Value extends ''
  ? []
  : Value extends `${infer Prefix}{${infer Param}}${infer Tail}`
    ? [...ExtractParams<Prefix>, Param, ...ExtractParams<Tail>]
    : Value extends `${infer Prefix}<${string}>${infer Inner}</>${infer Tail}`
      ? [
          ...ExtractParams<Prefix>,
          ...ExtractParams<Inner>,
          ...ExtractParams<Tail>
        ]
      : [];

type DateOrNumberPattern<Value> =
  Value extends `${infer Prefix}{${infer Param}, ${
    | DateFormat
    | NumberFormat}${infer Tail}`
    ? [...ExtractParams<Prefix>, Param, ...Params<Tail>]
    : never;

type ExtractPluralCase<Rest> =
  Rest extends `${PluralValue} {${infer Content}} ${infer Remaining}`
    ? [Content, ...ExtractPluralCase<Remaining>]
    : Rest extends `${PluralValue} {${infer Content}}}${infer Tail}`
      ? [Content, Tail]
      : [];

type ExtractSelectCase<Rest> =
  Rest extends `${string} {${infer Content}} ${infer Remaining}`
    ? [Content, ...ExtractSelectCase<Remaining>]
    : Rest extends `other {${infer Content}}}${infer Tail}`
      ? [Content, Tail]
      : [];

type Flatten<T extends ReadonlyArray<any>> = T extends [
  infer First,
  ...infer Rest
]
  ? [...(First extends Array<any> ? First : [First]), ...Flatten<Rest>]
  : [];

type SelectOrPluralPattern<Value> =
  Value extends `${infer Prefix}{${infer Param}, select, ${infer Rest}`
    ? ExtractSelectCase<Rest> extends [...infer Contents, infer Tail]
      ? Flatten<
          [
            ...ExtractParams<Prefix>,
            Param,
            ...{
              [K in keyof Contents]: ExtractParams<Contents[K] & string>;
            }[number],
            ...ExtractParams<Tail & string>
          ]
        >
      : never
    : Value extends `${infer Prefix}{${infer Param}, ${'plural' | 'selectordinal'}, ${infer Rest}`
      ? ExtractPluralCase<Rest> extends [...infer Contents, infer Tail]
        ? Flatten<
            [
              ...ExtractParams<Prefix>,
              Param,
              ...{
                [K in keyof Contents]: ExtractParams<Contents[K] & string>;
              }[number],
              ...ExtractParams<Tail & string>
            ]
          >
        : never
      : never;

type SimplePattern<Value> =
  Value extends `${infer Prefix}{${infer Param}}${infer Tail}`
    ? [...ExtractParams<Prefix>, Param, ...Params<Tail>]
    : never;

export type Params<Value extends string> =
  SelectOrPluralPattern<Value> extends never
    ? DateOrNumberPattern<Value> extends never
      ? SimplePattern<Value> extends never
        ? []
        : SimplePattern<Value>
      : DateOrNumberPattern<Value>
    : SelectOrPluralPattern<Value>;

type MessageParamsValues<Value extends string> = Record<
  Params<Value>[number],
  PlainTranslationValue
>;

export default MessageParamsValues;

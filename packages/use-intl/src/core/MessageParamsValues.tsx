import {PlainTranslationValue} from './TranslationValues.tsx';

type PluralValue =
  | `=${number}`
  | 'zero'
  | 'one'
  | 'two'
  | 'few'
  | 'many'
  | 'other';

type SelectType = 'plural' | 'selectordinal' | 'select';

type ExtractParams<Value extends PlainTranslationValue> = Value extends ''
  ? []
  : Value extends `${string}{${infer Param}}${infer Tail}`
    ? [Param, ...ExtractParams<Tail>]
    : [];

type NumberFormatOption = string | `::${string}`;
type NumberFormat = 'number' | `number, ${NumberFormatOption}`;

type DateFormatOption = string | `::${string}`;
type DateFormat = 'date' | `date, ${DateFormatOption}`;

export type Params<Value extends PlainTranslationValue> = Value extends ''
  ? []
  : // Select formatting
    Value extends `${string}{${infer Param}, select, ${string} {${infer Content}} ${string} {${infer Content2}} other {${infer Content3}}}${string}`
    ? [
        Param,
        ...ExtractParams<Content>,
        ...ExtractParams<Content2>,
        ...ExtractParams<Content3>
      ]
    : // Date formatting
      Value extends `${string}{${infer Param}, ${DateFormat}}${infer Tail}`
      ? [Param, ...Params<Tail>]
      : // Number formatting
        Value extends `${string}{${infer Param}, ${NumberFormat}}${infer Tail}`
        ? [Param, ...Params<Tail>]
        : // Plural/Selectordinal with 3 cases
          Value extends `${string}{${infer Param}, ${SelectType}, ${PluralValue} {${infer Content}} ${PluralValue} {${infer Content2}} ${PluralValue} {${infer Content3}}}${string}`
          ? [
              Param,
              ...ExtractParams<Content>,
              ...ExtractParams<Content2>,
              ...ExtractParams<Content3>
            ]
          : // Plural/Selectordinal with 2 cases
            Value extends `${string}{${infer Param}, ${SelectType}, ${PluralValue} {${infer Content}} ${PluralValue} {${infer Content2}}}${string}`
            ? [Param, ...ExtractParams<Content>, ...ExtractParams<Content2>]
            : // Simple cases (e.g `This is a {param}`)
              Value extends `${string}{${infer Param}}${infer Tail}`
              ? [Param, ...Params<Tail>]
              : [];

type MessageParamsValues<Value extends PlainTranslationValue> = Record<
  Params<Value>[number],
  PlainTranslationValue
>;
export default MessageParamsValues;

// From https://github.com/schummar/schummar-translate

type OnlyOptional<T> = Partial<T> extends T ? true : false;

export type Flatten<T> = T extends object
  ? {
      [P in keyof T]: T[P];
    }
  : T;

export type TranslateArgs<Value extends string, Options> =
  // any string => unknown arguments
  string extends Value
    ? [value?: Record<string, unknown>, options?: Options]
    : // for unions, extract arguments for each union member individually
      (Value extends any ? (k: GetICUArgs<Value>) => void : never) extends (
          k: infer Args
        ) => void
      ? OnlyOptional<Args> extends true
        ? // if no arguments are found, allow omitting values
          [values?: Flatten<Args>, options?: Options]
        : [values: Flatten<Args>, options?: Options]
      : never;

export type ICUArgument = string | number | boolean | Date;
export type ICUNumberArgument = number;
export type ICUDateArgument = Date | number | string;

export type OtherString = string & {__type: 'other'};

type Whitespace = ' ' | '\t' | '\n' | '\r';

/** Remove leading and tailing whitespace */
type Trim<T> = T extends `${Whitespace}${infer Rest}`
  ? Trim<Rest>
  : T extends `${infer Rest}${Whitespace}`
    ? Trim<Rest>
    : T extends string
      ? T
      : never;

/** Returns an array of top level blocks */
type FindBlocks<Text> = Text extends `${string}{${infer Right}` // find first {
  ? ReadBlock<'', Right, ''> extends [infer Block, infer Tail]
    ? [Block, ...FindBlocks<Tail>] // read block and find next block for tail
    : [{}]
  : []; // no {, return empty result

/** Find blocks for each tuple entry */
type TupleFindBlocks<T> = T extends readonly [infer First, ...infer Rest]
  ? [...FindBlocks<First>, ...TupleFindBlocks<Rest>]
  : [];

/** Read tail until the currently open block is closed. Return the block content and rest of tail */
type ReadBlock<
  Block extends string,
  Tail extends string,
  Depth extends string
> = Tail extends `${infer L1}}${infer R1}` // find first }
  ? L1 extends `${infer L2}{${infer R2}` // if preceeded by {, this opens a nested block
    ? ReadBlock<`${Block}${L2}{`, `${R2}}${R1}`, `${Depth}+`> // then continue search right of this {
    : Depth extends `+${infer Rest}` // else if depth > 0
      ? ReadBlock<`${Block}${L1}}`, R1, Rest> // then finished nested block, continue search right of first }
      : [`${Block}${L1}`, R1] // else return full block and search for next
  : []; // no }, return emptry result

/** Parse block, return variables with types and recursively find nested blocks within */
type ParseBlock<Block> =
  Block extends `${infer Name},${infer Format},${infer Rest}`
    ? Trim<Format> extends 'select'
      ? SelectOptions<Trim<Name>, Trim<Rest>>
      : {[K in Trim<Name>]: VariableType<Trim<Format>>} & TupleParseBlock<
          TupleFindBlocks<FindBlocks<Rest>>
        >
    : Block extends `${infer Name},${infer Format}`
      ? {[K in Trim<Name>]: VariableType<Trim<Format>>}
      : {[K in Trim<Block>]: ICUArgument};

/** Parse block for each tuple entry */
type TupleParseBlock<T> = T extends readonly [infer First, ...infer Rest]
  ? ParseBlock<First> & TupleParseBlock<Rest>
  : {};

type VariableType<T extends string> = T extends
  | 'number'
  | 'plural'
  | 'selectordinal'
  ? ICUNumberArgument
  : T extends 'date' | 'time'
    ? ICUDateArgument
    : ICUArgument;

// Select //////////////////////////////////////////////////////////////////////

type SelectOptions<Name extends string, Rest> = KeepAndMerge<
  ParseSelectBlock<Name, Rest>
>;

type ParseSelectBlock<
  Name extends string,
  Rest
> = Rest extends `${infer Left}{${infer Right}`
  ? ReadBlock<'', Right, ''> extends [infer Block, infer Tail]
    ?
        | ({[K in Name]: HandleOther<Trim<Left>>} & TupleParseBlock<
            FindBlocks<Block>
          >)
        | ParseSelectBlock<Name, Tail>
    : never
  : never;

type HandleOther<T> = 'other' extends T ? Exclude<T, 'other'> | OtherString : T;

type KeepAndMerge<T extends object> = T | MergeTypeUnion<T>;

type KeysFromUnion<T> = T extends T ? keyof T : never;

type SimpleTypeMerge<T, K extends keyof any> = T extends {[k in K]?: any}
  ? T[K] extends OtherString
    ? string & {}
    : T[K]
  : never;

type MergeTypeUnion<T extends object> = {
  [k in KeysFromUnion<T>]: SimpleTypeMerge<T, k>;
};

// Escapes /////////////////////////////////////////////////////////////////////

type EscapeLike = `'${'{' | '}' | '<' | '>'}`;
type StripEscapes<T> = T extends `${infer Left}''${infer Right}`
  ? `${Left}${Right}`
  : T extends `${infer Start}${EscapeLike}${string}'${infer End}`
    ? `${Start}${StripEscapes<End>}`
    : T extends `${infer Start}${EscapeLike}${string}`
      ? Start
      : T;

////////////////////////////////////////////////////////////////////////////////

// Makes type readable

// Make provided args optional
type MakeProvidedOptional<T, ProvidedArgs extends string = never> = {
  [K in keyof T as K extends ProvidedArgs ? never : K]: T[K];
} & {
  [K in ProvidedArgs & keyof T]?: T[K];
};

/** Calculates an object type with all variables and their types in the given ICU format string */
export type GetICUArgs<
  T extends string,
  ProvidedArgs extends string = never
> = Flatten<
  MakeProvidedOptional<
    TupleParseBlock<FindBlocks<StripEscapes<T>>>,
    ProvidedArgs
  >
>;

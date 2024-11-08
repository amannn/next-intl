// See https://github.com/schummar/schummar-translate/issues/28

export type Flatten<T> = T extends object
  ? {
      [P in keyof T]: T[P];
    }
  : T;

type OtherString = string & {__type: 'other'};

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
type ParseBlock<Block, ICUArgument, ICUNumberArgument, ICUDateArgument> =
  Block extends `${infer Name},${infer Format},${infer Rest}`
    ? Trim<Format> extends 'select'
      ? SelectOptions<
          Trim<Name>,
          Trim<Rest>,
          ICUArgument,
          ICUNumberArgument,
          ICUDateArgument
        >
      : {
          [K in Trim<Name>]: VariableType<
            Trim<Format>,
            ICUArgument,
            ICUNumberArgument,
            ICUDateArgument
          >;
        } & TupleParseBlock<
          TupleFindBlocks<FindBlocks<Rest>>,
          ICUArgument,
          ICUNumberArgument,
          ICUDateArgument
        >
    : Block extends `${infer Name},${infer Format}`
      ? {
          [K in Trim<Name>]: VariableType<
            Trim<Format>,
            ICUArgument,
            ICUNumberArgument,
            ICUDateArgument
          >;
        }
      : {[K in Trim<Block>]: ICUArgument};

/** Parse block for each tuple entry */
type TupleParseBlock<T, ICUArgument, ICUNumberArgument, ICUDateArgument> =
  T extends readonly [infer First, ...infer Rest]
    ? ParseBlock<First, ICUArgument, ICUNumberArgument, ICUDateArgument> &
        TupleParseBlock<Rest, ICUArgument, ICUNumberArgument, ICUDateArgument>
    : {};

type VariableType<
  T extends string,
  ICUArgument,
  ICUNumberArgument,
  ICUDateArgument
> = T extends 'number' | 'plural' | 'selectordinal'
  ? ICUNumberArgument
  : T extends 'date' | 'time'
    ? ICUDateArgument
    : ICUArgument;

// Select //////////////////////////////////////////////////////////////////////

type SelectOptions<
  Name extends string,
  Rest,
  ICUArgument,
  ICUNumberArgument,
  ICUDateArgument
> = KeepAndMerge<
  ParseSelectBlock<Name, Rest, ICUArgument, ICUNumberArgument, ICUDateArgument>
>;

type ParseSelectBlock<
  Name extends string,
  Rest,
  ICUArgument,
  ICUNumberArgument,
  ICUDateArgument
> = Rest extends `${infer Left}{${infer Right}`
  ? ReadBlock<'', Right, ''> extends [infer Block, infer Tail]
    ?
        | ({[K in Name]: HandleOther<Trim<Left>>} & TupleParseBlock<
            FindBlocks<Block>,
            ICUArgument,
            ICUNumberArgument,
            ICUDateArgument
          >)
        | ParseSelectBlock<
            Name,
            Tail,
            ICUArgument,
            ICUNumberArgument,
            ICUDateArgument
          >
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

// Export //////////////////////////////////////////////////////////////////////

/** Calculates an object type with all variables and their types in the given ICU format string */
type ICUArgs<
  Message extends string,
  ICUArgument,
  ICUNumberArgument,
  ICUDateArgument
> =
  // This is important when `t` is returned from a function and there's no
  // known `Message` yet. Otherwise, we'd run into an infinite loop.
  string extends Message
    ? {}
    : Flatten<
        TupleParseBlock<
          FindBlocks<StripEscapes<Message>>,
          ICUArgument,
          ICUNumberArgument,
          ICUDateArgument
        >
      >;

export default ICUArgs;

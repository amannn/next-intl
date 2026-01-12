export const TYPE_SELECT = 1;
export const TYPE_PLURAL = 2;
export const TYPE_SELECTORDINAL = 3;
export const TYPE_NUMBER = 4;
export const TYPE_DATE = 5;
export const TYPE_TIME = 6;

export type NumberStyleOptions = Intl.NumberFormatOptions & {scale?: number};

export type NumberStyle = string | NumberStyleOptions;

export type DateTimeStyleOptions = Intl.DateTimeFormatOptions;

export type DateTimeStyle = string | DateTimeStyleOptions;

export type PluralOptions = Record<string, CompiledNode>;

export type SelectOptions = Record<string, CompiledNode>;

// Tags have no type number - detected by: array.length >= 2 && typeof array[1] !== 'number'
// Format: ["tagName", child1, child2, ...]
type CompiledTagNode = [string, unknown, ...Array<unknown>];

export type CompiledNode =
  | string
  | 0
  | [string]
  | [string, typeof TYPE_SELECT, SelectOptions]
  | [string, typeof TYPE_PLURAL, PluralOptions]
  | [string, typeof TYPE_SELECTORDINAL, PluralOptions]
  | [string, typeof TYPE_NUMBER, NumberStyle?]
  | [string, typeof TYPE_DATE, DateTimeStyle?]
  | [string, typeof TYPE_TIME, DateTimeStyle?]
  | CompiledTagNode;

export type CompiledMessage = string | Array<CompiledNode>;

export const TYPE_SELECT = 1;
export const TYPE_PLURAL = 2;
export const TYPE_SELECTORDINAL = 3;
export const TYPE_FORMAT = 4;

export type FormatSubtype = 'number' | 'date' | 'time';

export type NumberStyleOptions = Intl.NumberFormatOptions;

export type NumberStyle = string | NumberStyleOptions;

export type DateTimeStyleOptions = Intl.DateTimeFormatOptions;

export type DateTimeStyle = string | DateTimeStyleOptions;

// Use interface to allow circular reference resolution
export interface PluralOptions {
  [key: string]: CompiledNode;
}

export interface SelectOptions {
  [key: string]: CompiledNode;
}

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
  | [string, typeof TYPE_FORMAT, FormatSubtype, (NumberStyle | DateTimeStyle)?]
  | CompiledTagNode;

export type CompiledMessage = string | Array<CompiledNode>;

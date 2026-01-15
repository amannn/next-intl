export const TYPE_POUND = 0;
export const TYPE_SELECT = 1;
export const TYPE_PLURAL = 2;
export const TYPE_SELECTORDINAL = 3;
export const TYPE_NUMBER = 4;
export const TYPE_DATE = 5;
export const TYPE_TIME = 6;

export type NumberStyleOptions = Intl.NumberFormatOptions;

export type NumberStyle = string | NumberStyleOptions;

export type DateTimeStyleOptions = Intl.DateTimeFormatOptions;

export type DateTimeStyle = string | DateTimeStyleOptions;

export type PluralOptions = Record<string, CompiledNode>;

export type SelectOptions = Record<string, CompiledNode>;

// Plain text literal
export type CompiledPlainTextNode = string;

// Simple argument reference: ["name"]
export type CompiledSimpleArgNode = [string];

// Pound sign (#) - represents the number in plural contexts
export type CompiledPoundNode = typeof TYPE_POUND;

// Select: ["name", TYPE_SELECT, {options}]
export type CompiledSelectNode = [string, typeof TYPE_SELECT, SelectOptions];

// Plural: ["name", TYPE_PLURAL, {options}]
export type CompiledPluralNode = [string, typeof TYPE_PLURAL, PluralOptions];

// Select ordinal: ["name", TYPE_SELECTORDINAL, {options}]
export type CompiledSelectOrdinalNode = [
  string,
  typeof TYPE_SELECTORDINAL,
  PluralOptions
];

// Number format: ["name", TYPE_NUMBER, style?]
export type CompiledNumberNode = [string, typeof TYPE_NUMBER, NumberStyle?];

// Date format: ["name", TYPE_DATE, style?]
export type CompiledDateNode = [string, typeof TYPE_DATE, DateTimeStyle?];

// Time format: ["name", TYPE_TIME, style?]
export type CompiledTimeNode = [string, typeof TYPE_TIME, DateTimeStyle?];

// Tags have no type constant - detected at runtime by:
// typeof node[1] !== 'number' || node[1] === TYPE_POUND
// (after simple args are handled via node[1] === undefined check)
// Format: ["tagName", child1, child2, ...]
// Empty tags get an empty string child: ["tagName", ""]
export type CompiledTagNode = [string, unknown, ...Array<unknown>];

export type CompiledNode =
  | CompiledPlainTextNode
  | CompiledSimpleArgNode
  | CompiledPoundNode
  | CompiledSelectNode
  | CompiledPluralNode
  | CompiledSelectOrdinalNode
  | CompiledNumberNode
  | CompiledDateNode
  | CompiledTimeNode
  | CompiledTagNode;

export type CompiledMessage = string | Array<CompiledNode>;

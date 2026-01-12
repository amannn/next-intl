export const TYPE_SELECT = 1;
export const TYPE_PLURAL = 2;
export const TYPE_SELECTORDINAL = 3;
export const TYPE_FORMAT = 4;
export const TYPE_TAG = 5;

export type FormatSubtype = 'number' | 'date' | 'time';

export interface NumberStyleOptions {
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
  currency?: string;
  unit?: string;
  scale?: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  minimumIntegerDigits?: number;
  minimumSignificantDigits?: number;
  maximumSignificantDigits?: number;
  useGrouping?: boolean;
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
  compactDisplay?: 'short' | 'long';
  signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';
}

export type NumberStyle = string | NumberStyleOptions;

export interface DateTimeStyleOptions {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  weekday?: 'narrow' | 'short' | 'long';
  era?: 'narrow' | 'short' | 'long';
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  timeZoneName?: 'short' | 'long';
  hour12?: boolean;
}

export type DateTimeStyle = string | DateTimeStyleOptions;

// Use interface to allow circular reference resolution
export interface PluralOptions {
  [key: string]: CompiledNode;
}

export interface SelectOptions {
  [key: string]: CompiledNode;
}

export type PluralOptionsWithOffset = PluralOptions | [PluralOptions, number];

export type CompiledNode =
  | string
  | 0
  | [string]
  | [string, typeof TYPE_SELECT, SelectOptions]
  | [string, typeof TYPE_PLURAL, PluralOptionsWithOffset]
  | [string, typeof TYPE_SELECTORDINAL, PluralOptionsWithOffset]
  | [string, typeof TYPE_FORMAT, FormatSubtype, (NumberStyle | DateTimeStyle)?]
  | [string, typeof TYPE_TAG, Array<CompiledNode>];

export type CompiledMessage = string | Array<CompiledNode>;

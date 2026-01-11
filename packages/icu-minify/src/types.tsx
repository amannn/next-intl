/**
 * Type constants for compiled message nodes.
 * Small integers for optimal minification.
 */
export const TYPE_SELECT = 1;
export const TYPE_PLURAL = 2;
export const TYPE_SELECTORDINAL = 3;
export const TYPE_FORMAT = 4;
export const TYPE_TAG = 5;

/**
 * Format subtypes for TYPE_FORMAT nodes.
 */
export type FormatSubtype = 'number' | 'date' | 'time';

/**
 * Options for plural/select branches.
 * Keys are category names ('one', 'other', etc.) or exact matches ('=0', '=1').
 */
export type PluralOptions = Record<string, CompiledNode>;
export type SelectOptions = Record<string, CompiledNode>;

/**
 * Number format options that can be used as style.
 * Can be a simple style name or an options object.
 */
export type NumberStyle =
  | string
  | {
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
    };

/**
 * Date/time format options.
 */
export type DateTimeStyle =
  | string
  | {
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
    };

/**
 * Plural options with offset support.
 * Format: [options] or [options, offset] when offset > 0
 */
export type PluralOptionsWithOffset =
  | PluralOptions
  | [PluralOptions, number]; // [options, offset]

/**
 * Compiled message format specification:
 *
 * - string: Static text, returned as-is
 * - 0: Pound sign (#) - references the current plural value
 * - [string]: Simple argument reference - length 1 means just lookup
 * - [string, TYPE_SELECT, SelectOptions]: Select statement
 * - [string, TYPE_PLURAL, PluralOptions | [PluralOptions, offset]]: Cardinal plural
 * - [string, TYPE_SELECTORDINAL, PluralOptions | [PluralOptions, offset]]: Ordinal plural
 * - [string, TYPE_FORMAT, FormatSubtype, style?]: Formatter (number/date/time)
 * - [string, TYPE_TAG, ...children]: Tag with children
 */
export type CompiledNode =
  | string // Static text
  | 0 // Pound sign (#) reference
  | [string] // Simple argument: ["name"]
  | [string, typeof TYPE_SELECT, SelectOptions] // Select: ["gender", 1, {female: "She", male: "He", other: "They"}]
  | [string, typeof TYPE_PLURAL, PluralOptionsWithOffset] // Plural: ["count", 2, {one: [0, " item"], other: [0, " items"]}]
  | [string, typeof TYPE_SELECTORDINAL, PluralOptionsWithOffset] // Ordinal: ["n", 3, {one: [0, "st"], two: [0, "nd"], other: [0, "th"]}]
  | [string, typeof TYPE_FORMAT, FormatSubtype, (NumberStyle | DateTimeStyle)?] // Formatter: ["date", 4, "date", "short"]
  | [string, typeof TYPE_TAG, ...CompiledNode[]]; // Tag: ["bold", 5, "child text", ["name"]]

/**
 * A compiled message can be:
 * - A plain string (for static messages with no interpolation)
 * - An array of compiled nodes (for messages with interpolation)
 */
export type CompiledMessage = string | CompiledNode[];

/**
 * Arguments passed to the format function.
 * Values can be primitives or tag handler functions.
 */
export type FormatValues = Record<
  string,
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | ((chunks: FormatResult) => unknown)
>;

/**
 * The result of formatting.
 * Can be a string or an array containing strings and other values (like JSX elements).
 */
export type FormatResult = string | Array<string | unknown>;

/**
 * Rich format result when tag handlers return non-string values.
 */
export type RichFormatResult<T = unknown> = Array<string | T>;

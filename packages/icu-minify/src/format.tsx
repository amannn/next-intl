import type {
  CompiledMessage,
  CompiledNode,
  PluralOptions,
  SelectOptions,
  NumberStyle,
  DateTimeStyle,
  PluralOptionsWithOffset
} from './types.js';
import {
  TYPE_SELECT,
  TYPE_PLURAL,
  TYPE_SELECTORDINAL,
  TYPE_FORMAT,
  TYPE_TAG
} from './types.js';

/**
 * Values that can be passed to format().
 * Tag handlers receive formatted chunks and can return any type.
 */
export type FormatValues<T = unknown> = Record<
  string,
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | ((chunks: Array<string | T>) => T)
>;

/**
 * Format a compiled ICU message with the given values.
 *
 * @param message - The compiled message
 * @param locale - The locale to use for formatting (e.g., 'en', 'de')
 * @param values - Values to interpolate into the message
 * @returns The formatted message as a string or array (when rich content is present)
 */
export function format<T = string>(
  message: CompiledMessage,
  locale: string,
  values: FormatValues<T> = {} as FormatValues<T>
): string | Array<string | T> {
  // Fast path for plain strings
  if (typeof message === 'string') {
    return message;
  }

  const result = formatNodes(message, locale, values, undefined);

  // Optimize: merge consecutive strings and check if all strings
  return optimizeResult(result) as string | Array<string | T>;
}

/**
 * Context for tracking the current plural value (for # substitution).
 */
interface PluralContext {
  value: number;
  locale: string;
}

/**
 * Format an array of compiled nodes.
 */
function formatNodes<T>(
  nodes: CompiledNode[],
  locale: string,
  values: FormatValues<T>,
  pluralCtx: PluralContext | undefined
): Array<string | T> {
  const result: Array<string | T> = [];

  for (const node of nodes) {
    const formatted = formatNode(node, locale, values, pluralCtx);
    if (Array.isArray(formatted)) {
      result.push(...formatted);
    } else {
      result.push(formatted as string | T);
    }
  }

  return result;
}

/**
 * Format a single compiled node.
 */
function formatNode<T>(
  node: CompiledNode,
  locale: string,
  values: FormatValues<T>,
  pluralCtx: PluralContext | undefined
): string | T | Array<string | T> {
  // Static text
  if (typeof node === 'string') {
    return node;
  }

  // Pound sign (#) - format the current plural value
  if (node === 0) {
    if (!pluralCtx) {
      throw new Error('# used outside of plural context');
    }
    return new Intl.NumberFormat(pluralCtx.locale).format(pluralCtx.value);
  }

  // Array nodes
  const [name, type, ...rest] = node as [string, number?, ...unknown[]];

  // Simple argument: ["name"]
  if (type === undefined) {
    const value = getValue(values, name);
    if (value instanceof Date) {
      return new Intl.DateTimeFormat(locale).format(value);
    }
    return String(value);
  }

  switch (type) {
    case TYPE_SELECT:
      return formatSelect(name, rest[0] as SelectOptions, locale, values, pluralCtx);

    case TYPE_PLURAL:
      return formatPlural(
        name,
        rest[0] as PluralOptionsWithOffset,
        locale,
        values,
        'cardinal'
      );

    case TYPE_SELECTORDINAL:
      return formatPlural(
        name,
        rest[0] as PluralOptionsWithOffset,
        locale,
        values,
        'ordinal'
      );

    case TYPE_FORMAT:
      return formatValue(
        name,
        rest[0] as 'number' | 'date' | 'time',
        rest[1] as NumberStyle | DateTimeStyle | undefined,
        locale,
        values
      );

    case TYPE_TAG:
      return formatTag(name, rest as CompiledNode[], locale, values, pluralCtx);

    default:
      throw new Error(`Unknown compiled node type: ${type}`);
  }
}

/**
 * Get a required value from the values object.
 */
function getValue<T>(
  values: FormatValues<T>,
  name: string
): string | number | boolean | Date | null | undefined | ((chunks: Array<string | T>) => T) {
  if (!(name in values)) {
    throw new Error(`Missing value for argument "${name}"`);
  }
  return values[name];
}

/**
 * Format a select node.
 */
function formatSelect<T>(
  name: string,
  options: SelectOptions,
  locale: string,
  values: FormatValues<T>,
  pluralCtx: PluralContext | undefined
): string | T | Array<string | T> {
  const value = String(getValue(values, name));
  const branch = options[value] ?? options.other;

  if (branch === undefined) {
    throw new Error(`No matching branch for select "${name}" with value "${value}"`);
  }

  return formatBranch(branch, locale, values, pluralCtx);
}

/**
 * Format a plural node (cardinal or ordinal).
 */
function formatPlural<T>(
  name: string,
  optionsWithOffset: PluralOptionsWithOffset,
  locale: string,
  values: FormatValues<T>,
  pluralType: Intl.PluralRulesOptions['type']
): string | T | Array<string | T> {
  const rawValue = getValue(values, name);
  if (typeof rawValue !== 'number') {
    throw new Error(`Expected number for plural argument "${name}", got ${typeof rawValue}`);
  }

  // Handle offset
  let options: PluralOptions;
  let offset = 0;
  if (Array.isArray(optionsWithOffset)) {
    [options, offset] = optionsWithOffset;
  } else {
    options = optionsWithOffset;
  }

  const value = rawValue - offset;

  // Check exact matches first (e.g., "=0", "=1")
  const exactKey = `=${rawValue}`;
  if (exactKey in options) {
    return formatBranch(options[exactKey], locale, values, {
      value,
      locale
    });
  }

  // Use PluralRules to determine category
  const category = new Intl.PluralRules(locale, {type: pluralType}).select(
    value
  );
  const branch = options[category] ?? options.other;

  if (branch === undefined) {
    throw new Error(
      `No matching branch for plural "${name}" with category "${category}"`
    );
  }

  return formatBranch(branch, locale, values, {value, locale});
}

/**
 * Format a branch (used by select and plural).
 */
function formatBranch<T>(
  branch: CompiledNode,
  locale: string,
  values: FormatValues<T>,
  pluralCtx: PluralContext | undefined
): string | T | Array<string | T> {
  // Branch can be a string, a node, or an array of nodes
  if (typeof branch === 'string') {
    return branch;
  }
  if (branch === 0) {
    return formatNode(branch, locale, values, pluralCtx);
  }
  if (Array.isArray(branch)) {
    // Check if this is a single node or an array of nodes
    const first = branch[0];

    // Single node: ["name"] or ["name", TYPE, ...]
    // The key distinction is:
    // - Single node: first element is a string (variable name), second (if exists) is a type constant (1-5)
    // - Array of nodes: contains mixed types (strings, 0, arrays)
    // Type constants are 1-5: SELECT=1, PLURAL=2, SELECTORDINAL=3, FORMAT=4, TAG=5
    // 0 is the pound sign, not a type constant
    if (typeof first === 'string') {
      if (branch.length === 1) {
        // Simple argument: ["name"]
        return formatNode(branch as CompiledNode, locale, values, pluralCtx);
      }
      const second = branch[1];
      if (
        typeof second === 'number' &&
        second >= TYPE_SELECT &&
        second <= TYPE_TAG
      ) {
        // Complex node: ["name", TYPE, ...]
        return formatNode(branch as CompiledNode, locale, values, pluralCtx);
      }
    }

    // This is an array of nodes (can start with string, 0, or another array)
    return formatNodes(branch as CompiledNode[], locale, values, pluralCtx);
  }
  return formatNode(branch, locale, values, pluralCtx);
}

/**
 * Format a value (number, date, time).
 */
function formatValue<T>(
  name: string,
  subtype: 'number' | 'date' | 'time',
  style: NumberStyle | DateTimeStyle | undefined,
  locale: string,
  values: FormatValues<T>
): string {
  const value = getValue(values, name);

  switch (subtype) {
    case 'number': {
      if (typeof value !== 'number') {
        throw new Error(
          `Expected number for "${name}", got ${typeof value}`
        );
      }
      const opts = getNumberFormatOptions(style as NumberStyle | undefined);
      let num = value;
      if (opts && 'scale' in opts && opts.scale) {
        num = value * opts.scale;
        delete opts.scale;
      }
      return new Intl.NumberFormat(locale, opts).format(num);
    }

    case 'date': {
      const date = value instanceof Date ? value : new Date(value as number);
      const opts = getDateTimeFormatOptions(
        style as DateTimeStyle | undefined,
        'date'
      );
      return new Intl.DateTimeFormat(locale, opts).format(date);
    }

    case 'time': {
      const date = value instanceof Date ? value : new Date(value as number);
      const opts = getDateTimeFormatOptions(
        style as DateTimeStyle | undefined,
        'time'
      );
      return new Intl.DateTimeFormat(locale, opts).format(date);
    }

    default:
      throw new Error(`Unknown format subtype: ${subtype}`);
  }
}

/**
 * Get Intl.NumberFormat options from style.
 */
function getNumberFormatOptions(
  style: NumberStyle | undefined
): (Intl.NumberFormatOptions & {scale?: number}) | undefined {
  if (!style) return undefined;

  if (typeof style === 'string') {
    // Named styles
    switch (style) {
      case 'percent':
        return {style: 'percent'};
      case 'integer':
        return {maximumFractionDigits: 0};
      default:
        // Assume it's a currency or unit
        if (style.includes('/')) {
          const [type, value] = style.split('/');
          if (type === 'currency') {
            return {style: 'currency', currency: value};
          }
          if (type === 'unit') {
            return {style: 'unit', unit: value};
          }
        }
        return undefined;
    }
  }

  return style as Intl.NumberFormatOptions & {scale?: number};
}

/**
 * Get Intl.DateTimeFormat options from style.
 */
function getDateTimeFormatOptions(
  style: DateTimeStyle | undefined,
  type: 'date' | 'time'
): Intl.DateTimeFormatOptions | undefined {
  if (!style) return undefined;

  if (typeof style === 'string') {
    // Named styles: short, medium, long, full
    if (type === 'date') {
      return {dateStyle: style as Intl.DateTimeFormatOptions['dateStyle']};
    }
    return {timeStyle: style as Intl.DateTimeFormatOptions['timeStyle']};
  }

  return style as Intl.DateTimeFormatOptions;
}

/**
 * Format a tag node.
 */
function formatTag<T>(
  name: string,
  children: CompiledNode[],
  locale: string,
  values: FormatValues<T>,
  pluralCtx: PluralContext | undefined
): string | T | Array<string | T> {
  const handler = getValue(values, name);

  if (typeof handler !== 'function') {
    throw new Error(`Expected function for tag handler "${name}"`);
  }

  const formattedChildren = formatNodes(children, locale, values, pluralCtx);
  const optimized = optimizeResult(formattedChildren);
  const childArray = typeof optimized === 'string' ? [optimized] : optimized;

  return handler(childArray as Array<string | T>);
}

/**
 * Optimize the result by merging consecutive strings.
 * Returns a string if all elements are strings.
 */
function optimizeResult<T>(
  result: Array<string | T>
): string | Array<string | T> {
  if (result.length === 0) {
    return '';
  }

  const merged: Array<string | T> = [];
  let currentString = '';

  for (const item of result) {
    if (typeof item === 'string') {
      currentString += item;
    } else {
      if (currentString) {
        merged.push(currentString);
        currentString = '';
      }
      merged.push(item);
    }
  }

  if (currentString) {
    merged.push(currentString);
  }

  // If all strings, return single string
  if (merged.length === 1 && typeof merged[0] === 'string') {
    return merged[0];
  }

  return merged;
}

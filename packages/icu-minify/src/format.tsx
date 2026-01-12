import {
  type CompiledMessage,
  type CompiledNode,
  type DateTimeStyle,
  type DateTimeStyleOptions,
  type NumberStyle,
  type NumberStyleOptions,
  type PluralOptions,
  type PluralOptionsWithOffset,
  type SelectOptions,
  TYPE_FORMAT,
  TYPE_PLURAL,
  TYPE_SELECT,
  TYPE_SELECTORDINAL,
  TYPE_TAG
} from './types.js';

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

export function format<T = string>(
  message: CompiledMessage,
  locale: string,
  values: FormatValues<T> = {} as FormatValues<T>
): string | Array<string | T> {
  if (typeof message === 'string') {
    return message;
  }

  const result = formatNodes(message, locale, values, undefined);
  return optimizeResult(result);
}

interface PluralContext {
  value: number;
  locale: string;
}

function formatNodes<T>(
  nodes: Array<CompiledNode>,
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
      result.push(formatted);
    }
  }

  return result;
}

function formatNode<T>(
  node: CompiledNode,
  locale: string,
  values: FormatValues<T>,
  pluralCtx: PluralContext | undefined
): string | T | Array<string | T> {
  if (typeof node === 'string') {
    return node;
  }

  if (node === 0) {
    if (!pluralCtx) {
      throw new Error('# used outside of plural context');
    }
    return new Intl.NumberFormat(pluralCtx.locale).format(pluralCtx.value);
  }

  const [name, type, ...rest] = node;

  if (type === undefined) {
    const value = getValue(values, name);
    if (value instanceof Date) {
      return new Intl.DateTimeFormat(locale).format(value);
    }
    return String(value);
  }

  switch (type) {
    case TYPE_SELECT:
      return formatSelect(
        name,
        rest[0] as SelectOptions,
        locale,
        values,
        pluralCtx
      );

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
      return formatTag(
        name,
        rest[0] as Array<CompiledNode>,
        locale,
        values,
        pluralCtx
      );

    default:
      throw new Error(`Unknown compiled node type: ${type}`);
  }
}

function getValue<T>(
  values: FormatValues<T>,
  name: string
): FormatValues<T>[string] {
  if (!(name in values)) {
    throw new Error(`Missing value for argument "${name}"`);
  }
  return values[name];
}

function formatSelect<T>(
  name: string,
  options: SelectOptions,
  locale: string,
  values: FormatValues<T>,
  pluralCtx: PluralContext | undefined
): string | T | Array<string | T> {
  const value = String(getValue(values, name));
  const branch: CompiledNode | undefined = options[value] ?? options.other;

  if (!branch) {
    throw new Error(
      `No matching branch for select "${name}" with value "${value}"`
    );
  }

  return formatBranch(branch, locale, values, pluralCtx);
}

function formatPlural<T>(
  name: string,
  optionsWithOffset: PluralOptionsWithOffset,
  locale: string,
  values: FormatValues<T>,
  pluralType: Intl.PluralRulesOptions['type']
): string | T | Array<string | T> {
  const rawValue = getValue(values, name);
  if (typeof rawValue !== 'number') {
    throw new Error(
      `Expected number for plural argument "${name}", got ${typeof rawValue}`
    );
  }

  let options: PluralOptions;
  let offset = 0;
  if (Array.isArray(optionsWithOffset)) {
    [options, offset] = optionsWithOffset;
  } else {
    options = optionsWithOffset;
  }

  const value = rawValue - offset;
  const exactKey = `=${rawValue}`;

  if (exactKey in options) {
    return formatBranch(options[exactKey], locale, values, {value, locale});
  }

  const category = new Intl.PluralRules(locale, {type: pluralType}).select(
    value
  );
  const branch: CompiledNode | undefined = options[category] ?? options.other;

  if (!branch) {
    throw new Error(
      `No matching branch for plural "${name}" with category "${category}"`
    );
  }

  return formatBranch(branch, locale, values, {value, locale});
}

function formatBranch<T>(
  branch: CompiledNode,
  locale: string,
  values: FormatValues<T>,
  pluralCtx: PluralContext | undefined
): string | T | Array<string | T> {
  if (typeof branch === 'string') {
    return branch;
  }
  if (branch === 0) {
    return formatNode(branch, locale, values, pluralCtx);
  }
  if (Array.isArray(branch)) {
    const first = branch[0];

    if (typeof first === 'string') {
      if (branch.length === 1) {
        return formatNode(branch as CompiledNode, locale, values, pluralCtx);
      }
      const second = branch[1];
      if (
        typeof second === 'number' &&
        second >= TYPE_SELECT &&
        second <= TYPE_TAG
      ) {
        return formatNode(branch as CompiledNode, locale, values, pluralCtx);
      }
    }

    return formatNodes(
      branch as Array<CompiledNode>,
      locale,
      values,
      pluralCtx
    );
  }
  return formatNode(branch, locale, values, pluralCtx);
}

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
        throw new Error(`Expected number for "${name}", got ${typeof value}`);
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

function getNumberFormatOptions(
  style: NumberStyle | undefined
): (Intl.NumberFormatOptions & {scale?: number}) | undefined {
  if (!style) return undefined;

  if (typeof style === 'string') {
    switch (style) {
      case 'percent':
        return {style: 'percent'};
      case 'integer':
        return {maximumFractionDigits: 0};
      default:
        if (style.includes('/')) {
          const [type, val] = style.split('/');
          if (type === 'currency') {
            return {style: 'currency', currency: val};
          }
          if (type === 'unit') {
            return {style: 'unit', unit: val};
          }
        }
        return undefined;
    }
  }

  return style as NumberStyleOptions & {scale?: number};
}

function getDateTimeFormatOptions(
  style: DateTimeStyle | undefined,
  type: 'date' | 'time'
): Intl.DateTimeFormatOptions | undefined {
  if (!style) return undefined;

  if (typeof style === 'string') {
    if (type === 'date') {
      return {dateStyle: style as Intl.DateTimeFormatOptions['dateStyle']};
    }
    return {timeStyle: style as Intl.DateTimeFormatOptions['timeStyle']};
  }

  return style as DateTimeStyleOptions;
}

function formatTag<T>(
  name: string,
  children: Array<CompiledNode>,
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

  return handler(childArray);
}

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

  if (merged.length === 1 && typeof merged[0] === 'string') {
    return merged[0];
  }

  return merged;
}

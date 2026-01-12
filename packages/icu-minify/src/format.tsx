import {
  type CompiledMessage,
  type CompiledNode,
  type DateTimeStyle,
  type DateTimeStyleOptions,
  type NumberStyle,
  type NumberStyleOptions,
  type PluralOptions,
  type SelectOptions,
  TYPE_FORMAT,
  TYPE_PLURAL,
  TYPE_SELECT,
  TYPE_SELECTORDINAL
} from './types.js';

// Could potentially share this with `use-intl` if we had a shared package for both
export type FormatValues<RichTextElement = unknown> = Record<
  string,
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | ((chunks: Array<string | RichTextElement>) => RichTextElement)
>;

export function format<RichTextElement = string>(
  message: CompiledMessage,
  locale: string,
  values: FormatValues<RichTextElement> = {} as FormatValues<RichTextElement>
): string | Array<string | RichTextElement> {
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

function formatNodes<RichTextElement>(
  nodes: Array<CompiledNode>,
  locale: string,
  values: FormatValues<RichTextElement>,
  pluralCtx: PluralContext | undefined
): Array<string | RichTextElement> {
  const result: Array<string | RichTextElement> = [];

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

function formatNode<RichTextElement>(
  node: CompiledNode,
  locale: string,
  values: FormatValues<RichTextElement>,
  pluralCtx: PluralContext | undefined
): string | RichTextElement | Array<string | RichTextElement> {
  if (typeof node === 'string') {
    return node;
  }

  if (node === 0) {
    if (!pluralCtx) {
      throw new Error(
        process.env.NODE_ENV !== 'production'
          ? '# used outside of plural context'
          : undefined
      );
    }
    return new Intl.NumberFormat(pluralCtx.locale).format(pluralCtx.value);
  }

  const [name, type, ...rest] = node;

  // Simple argument: ["name"]
  if (type === undefined) {
    const value = getValue(values, name);
    if (value instanceof Date) {
      return new Intl.DateTimeFormat(locale).format(value);
    }
    return String(value);
  }

  // Tag: ["tagName", child1, child2, ...] - detected by non-number second element
  if (typeof type !== 'number') {
    return formatTag(
      name,
      [type, ...rest] as Array<CompiledNode>,
      locale,
      values,
      pluralCtx
    );
  }

  // Typed nodes: ["name", TYPE, ...]
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
        rest[0] as PluralOptions,
        locale,
        values,
        'cardinal'
      );

    case TYPE_SELECTORDINAL:
      return formatPlural(
        name,
        rest[0] as PluralOptions,
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

    default:
      throw new Error(
        process.env.NODE_ENV !== 'production'
          ? `Unknown compiled node type: ${type}`
          : undefined
      );
  }
}

function getValue<RichTextElement>(
  values: FormatValues<RichTextElement>,
  name: string
): FormatValues<RichTextElement>[string] {
  if (!(name in values)) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? `Missing value for argument "${name}"`
        : undefined
    );
  }
  return values[name];
}

function formatSelect<RichTextElement>(
  name: string,
  options: SelectOptions,
  locale: string,
  values: FormatValues<RichTextElement>,
  pluralCtx: PluralContext | undefined
): string | RichTextElement | Array<string | RichTextElement> {
  const value = String(getValue(values, name));
  const branch: CompiledNode | undefined = options[value] ?? options.other;

  if (!branch) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? `No matching branch for select "${name}" with value "${value}"`
        : undefined
    );
  }

  return formatBranch(branch, locale, values, pluralCtx);
}

function formatPlural<RichTextElement>(
  name: string,
  options: PluralOptions,
  locale: string,
  values: FormatValues<RichTextElement>,
  pluralType: Intl.PluralRulesOptions['type']
): string | RichTextElement | Array<string | RichTextElement> {
  const value = getValue(values, name);
  if (typeof value !== 'number') {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? `Expected number for plural argument "${name}", got ${typeof value}`
        : undefined
    );
  }

  const exactKey = `=${value}`;

  if (exactKey in options) {
    return formatBranch(options[exactKey], locale, values, {value, locale});
  }

  const category = new Intl.PluralRules(locale, {type: pluralType}).select(
    value
  );
  const branch: CompiledNode | undefined = options[category] ?? options.other;

  if (!branch) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? `No matching branch for plural "${name}" with category "${category}"`
        : undefined
    );
  }

  return formatBranch(branch, locale, values, {value, locale});
}

function formatBranch<RichTextElement>(
  branch: CompiledNode,
  locale: string,
  values: FormatValues<RichTextElement>,
  pluralCtx: PluralContext | undefined
): string | RichTextElement | Array<string | RichTextElement> {
  if (typeof branch === 'string') {
    return branch;
  }
  if (branch === 0) {
    return formatNode(branch, locale, values, pluralCtx);
  }
  // Branch is an array - either a single complex node wrapped in array, or multiple nodes
  // formatNodes handles both correctly via formatNode's tag detection
  return formatNodes(branch as Array<CompiledNode>, locale, values, pluralCtx);
}

function formatValue<RichTextElement>(
  name: string,
  subtype: 'number' | 'date' | 'time',
  style: NumberStyle | DateTimeStyle | undefined,
  locale: string,
  values: FormatValues<RichTextElement>
): string {
  const value = getValue(values, name);

  switch (subtype) {
    case 'number': {
      if (typeof value !== 'number') {
        throw new Error(
          process.env.NODE_ENV !== 'production'
            ? `Expected number for "${name}", got ${typeof value}`
            : undefined
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
      throw new Error(
        process.env.NODE_ENV !== 'production'
          ? `Unknown format subtype: ${subtype}`
          : undefined
      );
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

function formatTag<RichTextElement>(
  name: string,
  children: Array<CompiledNode>,
  locale: string,
  values: FormatValues<RichTextElement>,
  pluralCtx: PluralContext | undefined
): string | RichTextElement | Array<string | RichTextElement> {
  const handler = getValue(values, name);

  if (typeof handler !== 'function') {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? `Expected function for tag handler "${name}"`
        : undefined
    );
  }

  const formattedChildren = formatNodes(children, locale, values, pluralCtx);
  const optimized = optimizeResult(formattedChildren);
  const childArray = typeof optimized === 'string' ? [optimized] : optimized;

  return handler(childArray);
}

function optimizeResult<RichTextElement>(
  result: Array<string | RichTextElement>
): string | Array<string | RichTextElement> {
  if (result.length === 0) {
    return '';
  }

  const merged: Array<string | RichTextElement> = [];
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

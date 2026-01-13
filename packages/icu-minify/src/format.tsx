import {
  type CompiledMessage,
  type CompiledNode,
  type DateTimeStyle,
  type DateTimeStyleOptions,
  type NumberStyle,
  type NumberStyleOptions,
  type PluralOptions,
  type SelectOptions,
  TYPE_DATE,
  TYPE_NUMBER,
  TYPE_PLURAL,
  TYPE_SELECT,
  TYPE_SELECTORDINAL,
  TYPE_TIME
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

export type Formats = {
  date?: Record<string, Intl.DateTimeFormatOptions>;
  number?: Record<string, Intl.NumberFormatOptions>;
  time?: Record<string, Intl.DateTimeFormatOptions>;
};

export type FormatOptions = {
  formats?: Formats;
  formatters: {
    getDateTimeFormat(
      ...args: ConstructorParameters<typeof Intl.DateTimeFormat>
    ): Intl.DateTimeFormat;
    getNumberFormat(
      ...args: ConstructorParameters<typeof Intl.NumberFormat>
    ): Intl.NumberFormat;
    getPluralRules(
      ...args: ConstructorParameters<typeof Intl.PluralRules>
    ): Intl.PluralRules;
  };
  timeZone?: string;
};

export default function format<RichTextElement = string>(
  message: CompiledMessage,
  locale: string,
  values: FormatValues<RichTextElement> = {} as FormatValues<RichTextElement>,
  options: FormatOptions
): string | RichTextElement | Array<string | RichTextElement> {
  if (typeof message === 'string') {
    return message;
  }

  const result = formatNodes(message, locale, values, options, undefined);
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
  options: FormatOptions,
  pluralCtx: PluralContext | undefined
): Array<string | RichTextElement> {
  const result: Array<string | RichTextElement> = [];

  for (const node of nodes) {
    const formatted = formatNode(node, locale, values, options, pluralCtx);
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
  options: FormatOptions,
  rawPluralCtx: PluralContext | undefined
): string | RichTextElement | Array<string | RichTextElement> {
  if (typeof node === 'string') {
    return node;
  }

  if (node === 0) {
    if (process.env.NODE_ENV !== 'production' && !rawPluralCtx) {
      throw new Error('# used outside of plural context');
    }
    const pluralCtx = rawPluralCtx as PluralContext;
    return options.formatters
      .getNumberFormat(pluralCtx.locale)
      .format(pluralCtx.value);
  }

  const [name, type, ...rest] = node;

  // Simple argument: ["name"]
  if (type === undefined) {
    const value = getValue(values, name) as string;
    return value;
  }

  // Tag: ["tagName", child1, child2, ...] - detected by non-number second element
  if (typeof type !== 'number') {
    return formatTag(
      name,
      [type, ...rest] as Array<CompiledNode>,
      locale,
      values,
      options,
      rawPluralCtx
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
        options,
        rawPluralCtx
      );

    case TYPE_PLURAL:
      return formatPlural(
        name,
        rest[0] as PluralOptions,
        locale,
        values,
        options,
        'cardinal'
      );

    case TYPE_SELECTORDINAL:
      return formatPlural(
        name,
        rest[0] as PluralOptions,
        locale,
        values,
        options,
        'ordinal'
      );

    case TYPE_NUMBER:
      return formatNumberValue(
        name,
        rest[0] as NumberStyle | undefined,
        locale,
        values,
        options
      );

    case TYPE_DATE:
      return formatDateTimeValue(
        name,
        rest[0] as DateTimeStyle | undefined,
        locale,
        values,
        options,
        'date'
      );

    case TYPE_TIME:
      return formatDateTimeValue(
        name,
        rest[0] as DateTimeStyle | undefined,
        locale,
        values,
        options,
        'time'
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
  if (process.env.NODE_ENV !== 'production' && !(name in values)) {
    throw new Error(`Missing value for argument "${name}"`);
  }
  return values[name];
}

function formatSelect<RichTextElement>(
  name: string,
  options: SelectOptions,
  locale: string,
  values: FormatValues<RichTextElement>,
  formatOptions: FormatOptions,
  pluralCtx: PluralContext | undefined
): string | RichTextElement | Array<string | RichTextElement> {
  const value = String(getValue(values, name));
  const branch: CompiledNode | undefined = options[value] ?? options.other;

  if (process.env.NODE_ENV !== 'production' && !branch) {
    throw new Error(
      `No matching branch for select "${name}" with value "${value}"`
    );
  }

  return formatBranch(branch, locale, values, formatOptions, pluralCtx);
}

function formatPlural<RichTextElement>(
  name: string,
  options: PluralOptions,
  locale: string,
  values: FormatValues<RichTextElement>,
  formatOptions: FormatOptions,
  pluralType: Intl.PluralRulesOptions['type']
): string | RichTextElement | Array<string | RichTextElement> {
  const rawValue = getValue(values, name);

  if (process.env.NODE_ENV !== 'production' && typeof rawValue !== 'number') {
    throw new Error(
      `Expected number for plural argument "${name}", got ${typeof rawValue}`
    );
  }
  const value = rawValue as number;

  const exactKey = `=${value}`;

  if (exactKey in options) {
    return formatBranch(options[exactKey], locale, values, formatOptions, {
      value,
      locale
    });
  }

  const category = formatOptions.formatters
    .getPluralRules(locale, {type: pluralType})
    .select(value);
  const branch: CompiledNode | undefined = options[category] ?? options.other;

  if (process.env.NODE_ENV !== 'production' && !branch) {
    throw new Error(
      `No matching branch for plural "${name}" with category "${category}"`
    );
  }

  return formatBranch(branch, locale, values, formatOptions, {value, locale});
}

function formatBranch<RichTextElement>(
  branch: CompiledNode,
  locale: string,
  values: FormatValues<RichTextElement>,
  formatOptions: FormatOptions,
  pluralCtx: PluralContext | undefined
): string | RichTextElement | Array<string | RichTextElement> {
  if (typeof branch === 'string') {
    return branch;
  }
  if (branch === 0) {
    return formatNode(branch, locale, values, formatOptions, pluralCtx);
  }
  // Branch is an array - either a single complex node wrapped in array, or multiple nodes
  // formatNodes handles both correctly via formatNode's tag detection
  return formatNodes(
    branch as Array<CompiledNode>,
    locale,
    values,
    formatOptions,
    pluralCtx
  );
}

function formatNumberValue<RichTextElement>(
  name: string,
  style: NumberStyle | undefined,
  locale: string,
  values: FormatValues<RichTextElement>,
  formatOptions: FormatOptions
): string {
  const rawValue = getValue(values, name);
  const value = rawValue as number;
  const opts = getNumberFormatOptions(style, formatOptions);
  return formatOptions.formatters.getNumberFormat(locale, opts).format(value);
}

function formatDateTimeValue<RichTextElement>(
  name: string,
  style: DateTimeStyle | undefined,
  locale: string,
  values: FormatValues<RichTextElement>,
  formatOptions: FormatOptions,
  type: 'date' | 'time'
): string {
  const rawValue = getValue(values, name);
  const date = rawValue as Date;
  const baseOpts = getDateTimeFormatOptions(style, type, formatOptions);
  const timeZone = formatOptions.timeZone;
  const opts =
    timeZone && !baseOpts?.timeZone
      ? baseOpts
        ? {timeZone, ...baseOpts}
        : {timeZone}
      : baseOpts;
  return formatOptions.formatters.getDateTimeFormat(locale, opts).format(date);
}

function getNumberFormatOptions(
  style: NumberStyle | undefined,
  formatOptions: FormatOptions
): Intl.NumberFormatOptions | undefined {
  if (!style) return undefined;

  if (typeof style === 'string') {
    switch (style) {
      case 'percent':
        return {style: 'percent'};
      case 'integer':
        return {maximumFractionDigits: 0};
      default:
        if (formatOptions.formats?.number?.[style]) {
          return formatOptions.formats.number[style];
        }
        if (style.includes('/')) {
          const [type, val] = style.split('/');
          if (type === 'currency') {
            return {style: 'currency', currency: val};
          }
          if (type === 'unit') {
            return {style: 'unit', unit: val};
          }
        }
        if (process.env.NODE_ENV !== 'production') {
          throw new Error(`Missing number format "${style}"`);
        }
        return undefined;
    }
  }

  return style as NumberStyleOptions;
}

function getDateTimeFormatOptions(
  style: DateTimeStyle | undefined,
  type: 'date' | 'time',
  formatOptions: FormatOptions
): Intl.DateTimeFormatOptions | undefined {
  if (!style) return undefined;

  if (typeof style === 'string') {
    const resolved =
      type === 'date'
        ? formatOptions.formats?.date?.[style]
        : formatOptions.formats?.time?.[style];
    if (process.env.NODE_ENV !== 'production' && !resolved) {
      throw new Error(`Missing ${type} format "${style}"`);
    }
    return resolved;
  }

  return style as DateTimeStyleOptions;
}

function formatTag<RichTextElement>(
  name: string,
  children: Array<CompiledNode>,
  locale: string,
  values: FormatValues<RichTextElement>,
  formatOptions: FormatOptions,
  pluralCtx: PluralContext | undefined
): string | RichTextElement | Array<string | RichTextElement> {
  const rawHandler = getValue(values, name);

  if (
    process.env.NODE_ENV !== 'production' &&
    typeof rawHandler !== 'function'
  ) {
    throw new Error(`Expected function for tag handler "${name}"`);
  }
  const handler = rawHandler as (
    chunks: Array<string | RichTextElement>
  ) => RichTextElement;

  const formattedChildren = formatNodes(
    children,
    locale,
    values,
    formatOptions,
    pluralCtx
  );
  const optimized = optimizeResult(formattedChildren);
  const childArray = Array.isArray(optimized) ? optimized : [optimized];
  return handler(childArray);
}

function optimizeResult<RichTextElement>(
  result: Array<string | RichTextElement>
): string | RichTextElement | Array<string | RichTextElement> {
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

  if (merged.length === 1) {
    return merged[0];
  }

  return merged;
}

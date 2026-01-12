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
  dateTime?: Record<string, Intl.DateTimeFormatOptions>;
  number?: Record<string, Intl.NumberFormatOptions>;
};

export type FormatOptions = {
  formats?: Formats;
  formatters?: {
    getDateTimeFormat?: (
      ...args: ConstructorParameters<typeof Intl.DateTimeFormat>
    ) => Intl.DateTimeFormat;
    getNumberFormat?: (
      ...args: ConstructorParameters<typeof Intl.NumberFormat>
    ) => Intl.NumberFormat;
    getPluralRules?: (
      ...args: ConstructorParameters<typeof Intl.PluralRules>
    ) => Intl.PluralRules;
  };
  timeZone?: string;
};

export function format<RichTextElement = string>(
  message: CompiledMessage,
  locale: string,
  values: FormatValues<RichTextElement> = {} as FormatValues<RichTextElement>,
  options?: FormatOptions
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
  options: FormatOptions | undefined,
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
  options: FormatOptions | undefined,
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
    const getNumberFormat = options?.formatters?.getNumberFormat;
    const numberFormat = getNumberFormat
      ? getNumberFormat(pluralCtx.locale)
      : new Intl.NumberFormat(pluralCtx.locale);
    return numberFormat.format(pluralCtx.value);
  }

  const [name, type, ...rest] = node;

  // Simple argument: ["name"]
  if (type === undefined) {
    const value = getValue(values, name);
    if (
      process.env.NODE_ENV !== 'production' &&
      (typeof value === 'boolean' || value instanceof Date)
    ) {
      throw new Error(
        `Invalid value type for argument "${name}": ${typeof value}`
      );
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
  formatOptions: FormatOptions | undefined,
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
  formatOptions: FormatOptions | undefined,
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

  const getPluralRules = formatOptions?.formatters?.getPluralRules;
  const pluralRules = getPluralRules
    ? getPluralRules(locale, {type: pluralType})
    : new Intl.PluralRules(locale, {type: pluralType});
  const category = pluralRules.select(value);
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
  formatOptions: FormatOptions | undefined,
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
  formatOptions: FormatOptions | undefined
): string {
  const rawValue = getValue(values, name);
  const value = rawValue as number;
  const opts = getNumberFormatOptions(style, formatOptions);
  const getNumberFormat = formatOptions?.formatters?.getNumberFormat;
  const numberFormat = getNumberFormat
    ? getNumberFormat(locale, opts)
    : new Intl.NumberFormat(locale, opts);
  return numberFormat.format(value);
}

function formatDateTimeValue<RichTextElement>(
  name: string,
  style: DateTimeStyle | undefined,
  locale: string,
  values: FormatValues<RichTextElement>,
  formatOptions: FormatOptions | undefined,
  type: 'date' | 'time'
): string {
  const rawValue = getValue(values, name);
  const date = rawValue as Date;
  const opts = getDateTimeFormatOptions(style, type, formatOptions);
  const getDateTimeFormat = formatOptions?.formatters?.getDateTimeFormat;
  const dateTimeFormat = getDateTimeFormat
    ? getDateTimeFormat(locale, opts)
    : new Intl.DateTimeFormat(locale, opts);
  return dateTimeFormat.format(date);
}

function getNumberFormatOptions(
  style: NumberStyle | undefined,
  formatOptions: FormatOptions | undefined
): Intl.NumberFormatOptions | undefined {
  if (!style) return undefined;

  if (typeof style === 'string') {
    switch (style) {
      case 'percent':
        return {style: 'percent'};
      case 'integer':
        return {maximumFractionDigits: 0};
      default:
        if (formatOptions?.formats?.number?.[style]) {
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
        return undefined;
    }
  }

  return style as NumberStyleOptions;
}

// Copied from `intl-messageformat` defaults (mirrors use-intl behavior)
const DATE_TIME_DEFAULTS = {
  date: {
    short: {month: 'numeric', day: 'numeric', year: '2-digit'},
    medium: {month: 'short', day: 'numeric', year: 'numeric'},
    long: {month: 'long', day: 'numeric', year: 'numeric'},
    full: {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}
  },
  time: {
    short: {hour: 'numeric', minute: 'numeric'},
    medium: {hour: 'numeric', minute: 'numeric', second: 'numeric'},
    long: {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short'
    },
    full: {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short'
    }
  }
} as const;

function getDateTimeFormatOptions(
  style: DateTimeStyle | undefined,
  type: 'date' | 'time',
  formatOptions: FormatOptions | undefined
): Intl.DateTimeFormatOptions | undefined {
  const timeZone = formatOptions?.timeZone;
  if (!style) {
    return timeZone ? {timeZone} : undefined;
  }

  if (typeof style === 'string') {
    const override = formatOptions?.formats?.dateTime?.[style];
    const defaults =
      style in DATE_TIME_DEFAULTS[type]
        ? (DATE_TIME_DEFAULTS[type] as Record<string, Intl.DateTimeFormatOptions>)[
            style
          ]
        : undefined;

    const resolved = defaults
      ? {...defaults, ...override}
      : override
        ? override
        : undefined;

    if (!resolved) return undefined;

    return timeZone && !resolved.timeZone ? {timeZone, ...resolved} : resolved;
  }

  const resolved = style as DateTimeStyleOptions;
  return timeZone && !resolved.timeZone ? {timeZone, ...resolved} : resolved;
}

function formatTag<RichTextElement>(
  name: string,
  children: Array<CompiledNode>,
  locale: string,
  values: FormatValues<RichTextElement>,
  formatOptions: FormatOptions | undefined,
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
  const childArray =
    typeof optimized === 'string'
      ? [optimized]
      : Array.isArray(optimized)
        ? optimized
        : [optimized];

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

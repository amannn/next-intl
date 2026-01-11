import {parse, TYPE} from '@formatjs/icu-messageformat-parser';
import type {
  MessageFormatElement,
  NumberElement,
  DateElement,
  TimeElement,
  PluralElement,
  SelectElement,
  TagElement
} from '@formatjs/icu-messageformat-parser';
import type {
  CompiledMessage,
  CompiledNode,
  PluralOptions,
  SelectOptions,
  NumberStyle,
  DateTimeStyle
} from './types.js';
import {
  TYPE_SELECT,
  TYPE_PLURAL,
  TYPE_SELECTORDINAL,
  TYPE_FORMAT,
  TYPE_TAG
} from './types.js';

/**
 * Compile an ICU MessageFormat string to a compact JSON representation.
 *
 * @param message - The ICU MessageFormat string to compile
 * @returns The compiled message representation
 * @throws Error if the message has invalid ICU syntax
 */
export function compile(message: string): CompiledMessage {
  const ast = parse(message);
  const compiled = compileNodes(ast);

  // Optimization: unwrap single-element arrays
  if (compiled.length === 0) {
    return '';
  }
  if (compiled.length === 1 && typeof compiled[0] === 'string') {
    return compiled[0];
  }

  return compiled;
}

/**
 * Compile an array of AST nodes to compiled nodes.
 */
function compileNodes(nodes: MessageFormatElement[]): CompiledNode[] {
  const result: CompiledNode[] = [];

  for (const node of nodes) {
    const compiled = compileNode(node);
    // Merge consecutive strings for optimization
    if (
      typeof compiled === 'string' &&
      result.length > 0 &&
      typeof result[result.length - 1] === 'string'
    ) {
      result[result.length - 1] += compiled;
    } else {
      result.push(compiled);
    }
  }

  return result;
}

/**
 * Convert compiled nodes to a single CompiledNode.
 * Used for plural/select branches.
 */
function compileNodesToNode(nodes: MessageFormatElement[]): CompiledNode {
  const compiled = compileNodes(nodes);

  if (compiled.length === 0) {
    return '';
  }
  if (compiled.length === 1) {
    return compiled[0];
  }
  return compiled as CompiledNode;
}

/**
 * Compile a single AST node to a compiled node.
 */
function compileNode(node: MessageFormatElement): CompiledNode {
  switch (node.type) {
    case TYPE.literal:
      return node.value;

    case TYPE.argument:
      return [node.value];

    case TYPE.number:
      return compileNumber(node);

    case TYPE.date:
      return compileDate(node);

    case TYPE.time:
      return compileTime(node);

    case TYPE.select:
      return compileSelect(node);

    case TYPE.plural:
      return compilePlural(node);

    case TYPE.pound:
      return 0;

    case TYPE.tag:
      return compileTag(node);

    default:
      throw new Error(
        `Unknown AST node type: ${(node as MessageFormatElement).type}`
      );
  }
}

/**
 * Compile a number format node.
 */
function compileNumber(node: NumberElement): CompiledNode {
  const style = compileNumberStyle(node.style);
  if (style !== undefined) {
    return [node.value, TYPE_FORMAT, 'number', style];
  }
  return [node.value, TYPE_FORMAT, 'number'];
}

/**
 * Compile number style from AST.
 */
function compileNumberStyle(
  style: NumberElement['style']
): NumberStyle | undefined {
  if (!style) {
    return undefined;
  }

  if (typeof style === 'string') {
    return style;
  }

  // NumberSkeleton - extract parsed options
  if ('parsedOptions' in style) {
    const opts = style.parsedOptions;
    const result: Record<string, unknown> = {};

    // Copy relevant options
    if (opts.style) result.style = opts.style;
    if (opts.currency) result.currency = opts.currency;
    if (opts.unit) result.unit = opts.unit;
    if (opts.minimumFractionDigits !== undefined)
      result.minimumFractionDigits = opts.minimumFractionDigits;
    if (opts.maximumFractionDigits !== undefined)
      result.maximumFractionDigits = opts.maximumFractionDigits;
    if (opts.minimumIntegerDigits !== undefined)
      result.minimumIntegerDigits = opts.minimumIntegerDigits;
    if (opts.minimumSignificantDigits !== undefined)
      result.minimumSignificantDigits = opts.minimumSignificantDigits;
    if (opts.maximumSignificantDigits !== undefined)
      result.maximumSignificantDigits = opts.maximumSignificantDigits;
    if (opts.useGrouping !== undefined) result.useGrouping = opts.useGrouping;
    if (opts.notation) result.notation = opts.notation;
    if (opts.compactDisplay) result.compactDisplay = opts.compactDisplay;
    if (opts.signDisplay) result.signDisplay = opts.signDisplay;
    if ('scale' in opts && opts.scale !== undefined) result.scale = opts.scale;

    return Object.keys(result).length > 0 ? (result as NumberStyle) : undefined;
  }

  return undefined;
}

/**
 * Compile a date format node.
 */
function compileDate(node: DateElement): CompiledNode {
  const style = compileDateTimeStyle(node.style);
  if (style !== undefined) {
    return [node.value, TYPE_FORMAT, 'date', style];
  }
  return [node.value, TYPE_FORMAT, 'date'];
}

/**
 * Compile a time format node.
 */
function compileTime(node: TimeElement): CompiledNode {
  const style = compileDateTimeStyle(node.style);
  if (style !== undefined) {
    return [node.value, TYPE_FORMAT, 'time', style];
  }
  return [node.value, TYPE_FORMAT, 'time'];
}

/**
 * Compile date/time style from AST.
 */
function compileDateTimeStyle(
  style: DateElement['style'] | TimeElement['style']
): DateTimeStyle | undefined {
  if (!style) {
    return undefined;
  }

  if (typeof style === 'string') {
    return style;
  }

  // DateTimeSkeleton - extract parsed options
  if ('parsedOptions' in style) {
    const opts = style.parsedOptions;
    const result: DateTimeStyle = {};

    // Copy relevant options
    if (opts.dateStyle)
      (result as Record<string, unknown>).dateStyle = opts.dateStyle;
    if (opts.timeStyle)
      (result as Record<string, unknown>).timeStyle = opts.timeStyle;
    if (opts.weekday)
      (result as Record<string, unknown>).weekday = opts.weekday;
    if (opts.era) (result as Record<string, unknown>).era = opts.era;
    if (opts.year) (result as Record<string, unknown>).year = opts.year;
    if (opts.month) (result as Record<string, unknown>).month = opts.month;
    if (opts.day) (result as Record<string, unknown>).day = opts.day;
    if (opts.hour) (result as Record<string, unknown>).hour = opts.hour;
    if (opts.minute) (result as Record<string, unknown>).minute = opts.minute;
    if (opts.second) (result as Record<string, unknown>).second = opts.second;
    if (opts.timeZoneName)
      (result as Record<string, unknown>).timeZoneName = opts.timeZoneName;
    if (opts.hour12 !== undefined)
      (result as Record<string, unknown>).hour12 = opts.hour12;

    return Object.keys(result).length > 0 ? result : undefined;
  }

  return undefined;
}

/**
 * Compile a select node.
 */
function compileSelect(node: SelectElement): CompiledNode {
  const options: SelectOptions = {};

  for (const [key, option] of Object.entries(node.options)) {
    options[key] = compileNodesToNode(option.value);
  }

  // Validate that 'other' exists
  if (!('other' in options)) {
    throw new Error(
      `Select statement for "${node.value}" must have an "other" case`
    );
  }

  return [node.value, TYPE_SELECT, options];
}

/**
 * Compile a plural node (cardinal or ordinal).
 */
function compilePlural(node: PluralElement): CompiledNode {
  const options: PluralOptions = {};

  for (const [key, option] of Object.entries(node.options)) {
    options[key] = compileNodesToNode(option.value);
  }

  // Validate that 'other' exists
  if (!('other' in options)) {
    throw new Error(
      `Plural statement for "${node.value}" must have an "other" case`
    );
  }

  const type =
    node.pluralType === 'ordinal' ? TYPE_SELECTORDINAL : TYPE_PLURAL;

  // Include offset if non-zero
  if (node.offset !== 0) {
    return [node.value, type, [options, node.offset]];
  }

  return [node.value, type, options];
}

/**
 * Compile a tag node.
 */
function compileTag(node: TagElement): CompiledNode {
  const children = compileNodes(node.children);
  return [node.value, TYPE_TAG, ...children];
}

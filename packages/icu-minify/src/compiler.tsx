import {
  type DateElement,
  type DateTimeSkeleton,
  type MessageFormatElement,
  type NumberElement,
  type NumberSkeleton,
  type PluralElement,
  type SelectElement,
  TYPE,
  type TagElement,
  type TimeElement,
  parse
} from '@formatjs/icu-messageformat-parser';
import {
  type CompiledMessage,
  type CompiledNode,
  type DateTimeStyleOptions,
  type NumberStyleOptions,
  type PluralOptions,
  type SelectOptions,
  TYPE_FORMAT,
  TYPE_PLURAL,
  TYPE_SELECT,
  TYPE_SELECTORDINAL,
  TYPE_TAG
} from './types.js';

export function compile(message: string): CompiledMessage {
  const ast = parse(message);
  const compiled = compileNodes(ast);

  if (compiled.length === 0) {
    return '';
  }
  if (compiled.length === 1 && typeof compiled[0] === 'string') {
    return compiled[0];
  }

  return compiled;
}

function compileNodes(nodes: Array<MessageFormatElement>): Array<CompiledNode> {
  const result: Array<CompiledNode> = [];

  for (const node of nodes) {
    const compiled = compileNode(node);
    if (
      typeof compiled === 'string' &&
      result.length > 0 &&
      typeof result[result.length - 1] === 'string'
    ) {
      (result[result.length - 1] as string) += compiled;
    } else {
      result.push(compiled);
    }
  }

  return result;
}

function compileNodesToNode(nodes: Array<MessageFormatElement>): CompiledNode {
  const compiled = compileNodes(nodes);

  if (compiled.length === 0) {
    return '';
  }
  if (compiled.length === 1) {
    return compiled[0];
  }
  return compiled as unknown as CompiledNode;
}

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
        `Unknown AST node type: ${(node as {type: number}).type}`
      );
  }
}

function compileNumber(node: NumberElement): CompiledNode {
  const style = compileNumberStyle(node.style);
  if (style !== undefined) {
    return [node.value, TYPE_FORMAT, 'number', style];
  }
  return [node.value, TYPE_FORMAT, 'number'];
}

const numberOptionKeys: Array<keyof NumberStyleOptions> = [
  'style',
  'currency',
  'unit',
  'scale',
  'minimumFractionDigits',
  'maximumFractionDigits',
  'minimumIntegerDigits',
  'minimumSignificantDigits',
  'maximumSignificantDigits',
  'useGrouping',
  'notation',
  'compactDisplay',
  'signDisplay'
];

function compileNumberStyle(
  style: NumberElement['style']
): string | NumberStyleOptions | undefined {
  if (!style) {
    return undefined;
  }

  if (typeof style === 'string') {
    return style;
  }

  if ('parsedOptions' in style) {
    return extractOptions(
      (style as NumberSkeleton).parsedOptions as Record<string, unknown>,
      numberOptionKeys
    ) as NumberStyleOptions | undefined;
  }

  return undefined;
}

function compileDate(node: DateElement): CompiledNode {
  const style = compileDateTimeStyle(node.style);
  if (style !== undefined) {
    return [node.value, TYPE_FORMAT, 'date', style];
  }
  return [node.value, TYPE_FORMAT, 'date'];
}

function compileTime(node: TimeElement): CompiledNode {
  const style = compileDateTimeStyle(node.style);
  if (style !== undefined) {
    return [node.value, TYPE_FORMAT, 'time', style];
  }
  return [node.value, TYPE_FORMAT, 'time'];
}

const dateTimeOptionKeys: Array<keyof DateTimeStyleOptions> = [
  'dateStyle',
  'timeStyle',
  'weekday',
  'era',
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
  'timeZoneName',
  'hour12'
];

function compileDateTimeStyle(
  style: DateElement['style'] | TimeElement['style']
): string | DateTimeStyleOptions | undefined {
  if (!style) {
    return undefined;
  }

  if (typeof style === 'string') {
    return style;
  }

  if ('parsedOptions' in style) {
    return extractOptions(
      (style as DateTimeSkeleton).parsedOptions as Record<string, unknown>,
      dateTimeOptionKeys
    ) as DateTimeStyleOptions | undefined;
  }

  return undefined;
}

function extractOptions<K extends string>(
  source: {[key: string]: unknown},
  keys: Array<K>
): Partial<Record<K, unknown>> | undefined {
  const result: Partial<Record<K, unknown>> = {};
  let hasValue = false;

  for (const key of keys) {
    const value = source[key];
    if (value !== undefined) {
      result[key] = value;
      hasValue = true;
    }
  }

  return hasValue ? result : undefined;
}

function compileSelect(node: SelectElement): CompiledNode {
  const options: SelectOptions = {};

  for (const [key, option] of Object.entries(node.options)) {
    options[key] = compileNodesToNode(option.value);
  }

  return [node.value, TYPE_SELECT, options];
}

function compilePlural(node: PluralElement): CompiledNode {
  const options: PluralOptions = {};

  for (const [key, option] of Object.entries(node.options)) {
    options[key] = compileNodesToNode(option.value);
  }

  const type = node.pluralType === 'ordinal' ? TYPE_SELECTORDINAL : TYPE_PLURAL;

  if (node.offset !== 0) {
    return [node.value, type, [options, node.offset]];
  }

  return [node.value, type, options];
}

function compileTag(node: TagElement): CompiledNode {
  const children = compileNodes(node.children);
  return [node.value, TYPE_TAG, children];
}

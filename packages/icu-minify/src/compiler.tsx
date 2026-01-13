import {
  type DateElement,
  type DateTimeSkeleton,
  type MessageFormatElement,
  type NumberElement,
  type NumberSkeleton,
  type PluralElement as PluralElementBase,
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
  TYPE_DATE,
  TYPE_NUMBER,
  TYPE_PLURAL,
  TYPE_POUND,
  TYPE_SELECT,
  TYPE_SELECTORDINAL,
  TYPE_TIME
} from './types.js';

export default function compile(message: string): CompiledMessage {
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
    const node = compiled[0];
    // Only unwrap strings and pound signs, not array-based nodes (tags, typed nodes)
    // This preserves structure for formatBranch to correctly identify single nodes vs arrays
    if (typeof node === 'string' || node === TYPE_POUND) {
      return node;
    }
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
      return TYPE_POUND;

    case TYPE.tag:
      return compileTag(node);

    default:
      throw new Error(
        `Unknown AST node type: ${(node as {type: number}).type}`
      );
  }
}

function compileNumber(node: NumberElement): CompiledNode {
  const result: CompiledNode = [node.value, TYPE_NUMBER];

  const style = compileNumberStyle(node.style);
  if (style !== undefined) {
    result.push(style);
  }

  return result;
}

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
    const opts = (style as NumberSkeleton).parsedOptions;
    return Object.keys(opts).length > 0
      ? (opts as NumberStyleOptions)
      : undefined;
  }

  return undefined;
}

function compileDate(node: DateElement): CompiledNode {
  const result: CompiledNode = [node.value, TYPE_DATE];

  const style = compileDateTimeStyle(node.style);
  if (style !== undefined) {
    result.push(style);
  }

  return result;
}

function compileTime(node: TimeElement): CompiledNode {
  const result: CompiledNode = [node.value, TYPE_TIME];

  const style = compileDateTimeStyle(node.style);
  if (style !== undefined) {
    result.push(style);
  }

  return result;
}

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
    const opts = (style as DateTimeSkeleton).parsedOptions;
    return Object.keys(opts).length > 0
      ? (opts as DateTimeStyleOptions)
      : undefined;
  }

  return undefined;
}

function compileSelect(node: SelectElement): CompiledNode {
  const options: SelectOptions = {};

  for (const [key, option] of Object.entries(node.options)) {
    options[key] = compileNodesToNode(option.value);
  }

  return [node.value, TYPE_SELECT, options];
}

// Not supported
type PluralElement = Omit<PluralElementBase, 'offset'>;
function compilePlural(node: PluralElement): CompiledNode {
  const options: PluralOptions = {};

  for (const [key, option] of Object.entries(node.options)) {
    options[key] = compileNodesToNode(option.value);
  }

  return [
    node.value,
    node.pluralType === 'ordinal' ? TYPE_SELECTORDINAL : TYPE_PLURAL,
    options
  ];
}

function compileTag(node: TagElement): CompiledNode {
  const children = compileNodes(node.children);
  const result: Array<unknown> = [node.value];

  // Tags have no type number - detected at runtime by typeof node[1] !== 'number'
  // Empty tags get an empty string child to distinguish from simple arguments
  if (children.length === 0) {
    result.push('');
  } else {
    result.push(...children);
  }

  return result as CompiledNode;
}

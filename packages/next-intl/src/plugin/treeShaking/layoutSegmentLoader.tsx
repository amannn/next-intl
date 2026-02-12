import path from 'path';
import {parseSync, printSync} from '@swc/core';
import SourceFileFilter from '../../extractor/source/SourceFileFilter.js';
import {getSegmentId} from '../../tree-shaking/EntryScanner.js';
import type {TurbopackLoaderContext} from '../types.js';

const NEXT_INTL_CLIENT_PROVIDER_TAG = 'NextIntlClientProvider';
const NEXT_APP_DIRS = ['app', 'src/app'];
const SYNTHETIC_SPAN = {end: 0, start: 0};

export type LayoutSegmentLoaderConfig = Record<string, never>;

export function resolveAppDirForResource(
  rootContext: string,
  resourcePath: string
): string | undefined {
  const appDirs = NEXT_APP_DIRS.map((appDir) =>
    path.resolve(rootContext, appDir)
  );

  for (const appDir of appDirs) {
    if (SourceFileFilter.isWithinPath(resourcePath, appDir)) {
      return appDir;
    }
  }

  return undefined;
}

function isIdentifier(node: any, value: string): boolean {
  return node?.type === 'Identifier' && node.value === value;
}

function unwrapExpression(node: any): any {
  if (!node || typeof node !== 'object') {
    return node;
  }

  if (node.type === 'ParenthesisExpression') {
    return unwrapExpression(node.expression);
  }

  return node;
}

function isStringLiteralWithValue(node: any, value: string): boolean {
  return node?.type === 'StringLiteral' && node.value === value;
}

function hasLayoutSegmentProp(attributes: Array<any>): boolean {
  return attributes.some(
    (attribute) =>
      attribute.type === 'JSXAttribute' &&
      isIdentifier(attribute.name, '__layoutSegment')
  );
}

function hasInferMessagesProp(attributes: Array<any>): boolean {
  return attributes.some((attribute) => {
    if (
      attribute.type !== 'JSXAttribute' ||
      !isIdentifier(attribute.name, 'messages')
    ) {
      return false;
    }

    if (isStringLiteralWithValue(attribute.value, 'infer')) {
      return true;
    }

    if (attribute.value?.type !== 'JSXExpressionContainer') {
      return false;
    }

    return isStringLiteralWithValue(
      unwrapExpression(attribute.value.expression),
      'infer'
    );
  });
}

function createLayoutSegmentAttribute(segmentId: string) {
  return {
    name: {
      span: SYNTHETIC_SPAN,
      type: 'Identifier',
      value: '__layoutSegment'
    },
    span: SYNTHETIC_SPAN,
    type: 'JSXAttribute',
    value: {
      raw: JSON.stringify(segmentId),
      span: SYNTHETIC_SPAN,
      type: 'StringLiteral',
      value: segmentId
    }
  };
}

function walkAst(node: unknown, visit: (node: any) => void) {
  if (!node || typeof node !== 'object') {
    return;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      walkAst(item, visit);
    }
    return;
  }

  const objectNode = node as Record<string, unknown>;
  visit(objectNode);

  for (const value of Object.values(objectNode)) {
    walkAst(value, visit);
  }
}

function addLayoutSegmentAttributes(ast: any, segmentId: string): boolean {
  let didMutate = false;

  walkAst(ast, (node) => {
    if (node.type !== 'JSXOpeningElement') {
      return;
    }

    if (!isIdentifier(node.name, NEXT_INTL_CLIENT_PROVIDER_TAG)) {
      return;
    }

    const attributes = node.attributes as Array<any>;
    if (hasLayoutSegmentProp(attributes)) {
      return;
    }
    if (!hasInferMessagesProp(attributes)) {
      return;
    }

    attributes.push(createLayoutSegmentAttribute(segmentId));
    didMutate = true;
  });

  return didMutate;
}

export function injectLayoutSegment(source: string, segmentId: string): string {
  if (!source.includes('<NextIntlClientProvider')) {
    return source;
  }

  let ast;
  try {
    ast = parseSync(source, {
      syntax: 'typescript',
      target: 'esnext',
      tsx: true
    });
  } catch {
    return source;
  }

  const didMutate = addLayoutSegmentAttributes(ast, segmentId);
  if (!didMutate) {
    return source;
  }

  try {
    return printSync(ast, {sourceMaps: false}).code;
  } catch {
    return source;
  }
}

export default function layoutSegmentLoader(
  this: TurbopackLoaderContext<LayoutSegmentLoaderConfig>,
  source: string
) {
  const appDir = resolveAppDirForResource(this.rootContext, this.resourcePath);
  if (!appDir) {
    return source;
  }

  const segmentId = getSegmentId(this.resourcePath, appDir);
  return injectLayoutSegment(source, segmentId);
}

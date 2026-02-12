import path from 'path';
import {parseSync, printSync} from '@swc/core';
import SourceFileFilter from '../../extractor/source/SourceFileFilter.js';
import {getSegmentId} from '../../tree-shaking/EntryScanner.js';
import type {TurbopackLoaderContext} from '../types.js';

const CLIENT_MANIFEST_MODULE_NAME = 'next-intl/_client-manifest';
const INFERRED_MESSAGES_MANIFEST_PROP = '__inferredMessagesManifest';
const INFERRED_MESSAGES_MANIFEST_VARIABLE = '__nextIntlLayoutClientManifest';
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

function hasInferredMessagesManifestProp(attributes: Array<any>): boolean {
  return attributes.some(
    (attribute) =>
      attribute.type === 'JSXAttribute' &&
      isIdentifier(attribute.name, INFERRED_MESSAGES_MANIFEST_PROP)
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

function createInferredMessagesManifestAttribute() {
  return {
    name: {
      span: SYNTHETIC_SPAN,
      type: 'Identifier',
      value: INFERRED_MESSAGES_MANIFEST_PROP
    },
    span: SYNTHETIC_SPAN,
    type: 'JSXAttribute',
    value: {
      expression: {
        ctxt: 0,
        optional: false,
        span: SYNTHETIC_SPAN,
        type: 'Identifier',
        value: INFERRED_MESSAGES_MANIFEST_VARIABLE
      },
      span: SYNTHETIC_SPAN,
      type: 'JSXExpressionContainer'
    }
  };
}

function toPosixPath(pathname: string): string {
  return pathname.split(path.sep).join('/');
}

export function getSegmentManifestImportSource(
  rootContext: string,
  resourcePath: string,
  segmentId: string
): string {
  const relativeLayoutPath = toPosixPath(
    path.relative(rootContext, resourcePath)
  );
  const query = new URLSearchParams({
    layout: relativeLayoutPath,
    segment: segmentId
  });
  return `${CLIENT_MANIFEST_MODULE_NAME}?${query.toString()}`;
}

function hasManifestImport(ast: any, source: string): boolean {
  return (ast.body ?? []).some(
    (statement: any) =>
      statement.type === 'ImportDeclaration' &&
      statement.source?.value === source
  );
}

function insertManifestImport(ast: any, source: string): boolean {
  let importDeclaration;
  try {
    importDeclaration = parseSync(
      `import ${INFERRED_MESSAGES_MANIFEST_VARIABLE} from ${JSON.stringify(source)};`,
      {
        syntax: 'typescript',
        target: 'esnext',
        tsx: true
      }
    ).body[0];
  } catch {
    return false;
  }

  const body = ast.body as Array<any>;
  let insertIndex = 0;

  while (
    insertIndex < body.length &&
    body[insertIndex].type === 'ExpressionStatement' &&
    body[insertIndex].expression?.type === 'StringLiteral'
  ) {
    insertIndex++;
  }

  body.splice(insertIndex, 0, importDeclaration);
  return true;
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

function addLayoutSegmentAttributes(
  ast: any,
  segmentId: string
): {addedManifestProp: boolean; didMutate: boolean} {
  let addedManifestProp = false;
  let didMutate = false;

  walkAst(ast, (node) => {
    if (node.type !== 'JSXOpeningElement') {
      return;
    }

    if (!isIdentifier(node.name, NEXT_INTL_CLIENT_PROVIDER_TAG)) {
      return;
    }

    const attributes = node.attributes as Array<any>;
    if (!hasInferMessagesProp(attributes)) {
      return;
    }

    if (!hasLayoutSegmentProp(attributes)) {
      attributes.push(createLayoutSegmentAttribute(segmentId));
      didMutate = true;
    }

    if (!hasInferredMessagesManifestProp(attributes)) {
      attributes.push(createInferredMessagesManifestAttribute());
      addedManifestProp = true;
      didMutate = true;
    }
  });

  return {addedManifestProp, didMutate};
}

export function injectLayoutSegment(
  source: string,
  {
    resourcePath,
    rootContext,
    segmentId
  }: {
    resourcePath: string;
    rootContext: string;
    segmentId: string;
  }
): string {
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

  const {addedManifestProp, didMutate} = addLayoutSegmentAttributes(
    ast,
    segmentId
  );
  if (!didMutate) {
    return source;
  }

  if (addedManifestProp) {
    const manifestImportSource = getSegmentManifestImportSource(
      rootContext,
      resourcePath,
      segmentId
    );
    if (!hasManifestImport(ast, manifestImportSource)) {
      insertManifestImport(ast, manifestImportSource);
    }
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
  return injectLayoutSegment(source, {
    resourcePath: this.resourcePath,
    rootContext: this.rootContext,
    segmentId
  });
}

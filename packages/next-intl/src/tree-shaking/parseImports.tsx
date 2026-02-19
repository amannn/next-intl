/* eslint-disable @typescript-eslint/no-unnecessary-condition -- AST shape varies */
import {parseSync} from '@swc/core';

export default function parseImports(source: string): Array<string> {
  const ast = parseSync(source, {
    syntax: 'typescript',
    tsx: true
  });
  const specifiers: Array<string> = [];

  for (const stmt of ast.body) {
    if (stmt.type === 'ImportDeclaration') {
      if ('typeOnly' in stmt && stmt.typeOnly) continue;
      const src = stmt.source?.value;
      if (typeof src === 'string') specifiers.push(src);
    }
    if (
      (stmt.type === 'ExportAllDeclaration' ||
        stmt.type === 'ExportDeclaration' ||
        stmt.type === 'ExportNamedDeclaration') &&
      'source' in stmt &&
      stmt.source?.value
    ) {
      specifiers.push(stmt.source.value as string);
    }
  }

  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    const n = node as Record<string, unknown>;
    if (
      n.type === 'CallExpression' &&
      (n.callee as Record<string, unknown>)?.type === 'Import'
    ) {
      const arg = (
        n.arguments as Array<Record<string, unknown> | undefined>
      )?.[0]?.expression;
      const spec = getStaticString(arg);
      if (spec) specifiers.push(spec);
    }
    for (const value of Object.values(n)) {
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === 'object') walk(value);
    }
  }
  walk(ast.body);

  return specifiers;
}

function getStaticString(node: unknown): string | undefined {
  if (!node || typeof node !== 'object') return undefined;
  const n = node as Record<string, unknown>;
  if (n.type === 'StringLiteral') return n.value as string;
  if (n.type === 'TemplateLiteral' || n.type === 'Tpl') {
    const expressions = (n.expressions ?? n.exprs) as Array<unknown>;
    if (expressions?.length) return undefined;
    const quasis = (n.quasis ?? []) as Array<Record<string, unknown>>;
    const first = quasis[0];
    const raw =
      typeof first?.cooked === 'string'
        ? first.cooked
        : typeof first?.raw === 'string'
          ? first.raw
          : undefined;
    return raw ?? undefined;
  }
  return undefined;
}

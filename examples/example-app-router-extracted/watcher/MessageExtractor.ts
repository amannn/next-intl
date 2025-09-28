import fs from 'fs/promises';
import path from 'path';
import {
  parse,
  type Program,
  type Module,
  type VariableDeclarator,
  type CallExpression,
  type ImportDeclaration,
  type StringLiteral,
  type Node
} from '@swc/core';
import type {ExtractedMessage} from './types.ts';
import KeyGenerator from './KeyGenerator.ts';

class Scope {
  parent?: Scope;
  vars = new Map<string, string>();

  constructor(parent?: Scope) {
    this.parent = parent;
  }

  define(name: string, kind: string) {
    this.vars.set(name, kind);
  }

  lookup(name: string): string | undefined {
    if (this.vars.has(name)) return this.vars.get(name);
    return this.parent?.lookup(name);
  }
}

export default class MessageExtractor {
  async extractFromFile(filePath: string) {
    const absPath = path.resolve(filePath);
    const code = await fs.readFile(absPath, 'utf8');

    const ast = await parse(code, {
      syntax: 'typescript',
      tsx: true,
      target: 'es2022',
      decorators: true
    });

    return this.extractFromAST(ast);
  }

  private extractFromAST(ast: Program | Module): ExtractedMessage[] {
    const results: ExtractedMessage[] = [];
    let hookLocalName: string | null = null;

    const scopeStack: Scope[] = [new Scope()];
    const currentScope = () => scopeStack[scopeStack.length - 1];

    function visit(node: Node) {
      if (!node || typeof node !== 'object') return;

      switch (node.type) {
        case 'ImportDeclaration': {
          const decl = node as ImportDeclaration;
          for (const spec of decl.specifiers ?? []) {
            if (spec.type === 'ImportSpecifier') {
              // Check if the imported name is 'useExtracted' or if the local name is 'useExtracted'
              const importedName = spec.imported?.value;
              const localName = spec.local.value;

              if (
                importedName === 'useExtracted' ||
                localName === 'useExtracted'
              ) {
                hookLocalName = localName;
              }
            }
          }
          break;
        }

        case 'VariableDeclarator': {
          const decl = node as VariableDeclarator;
          if (
            decl.init?.type === 'CallExpression' &&
            decl.init.callee.type === 'Identifier' &&
            decl.init.callee.value === hookLocalName
          ) {
            if (decl.id.type === 'Identifier') {
              currentScope().define(decl.id.value, 'translator');
            }
          }
          break;
        }

        case 'CallExpression': {
          const call = node as CallExpression;
          if (call.callee.type === 'Identifier') {
            const name = call.callee.value;
            const resolved = currentScope().lookup(name);
            if (resolved === 'translator') {
              const arg0 = call.arguments?.[0]?.expression;
              if (arg0?.type === 'StringLiteral') {
                const stringLiteral = arg0 as StringLiteral;
                results.push({
                  id: KeyGenerator.generate(stringLiteral.value),
                  message: stringLiteral.value
                });
              }
            }
          }
          break;
        }

        case 'FunctionDeclaration':
        case 'FunctionExpression':
        case 'ArrowFunctionExpression':
        case 'BlockStatement': {
          scopeStack.push(new Scope(currentScope()));
          for (const key in node) {
            const child = (node as unknown as Record<string, unknown>)[key];
            if (Array.isArray(child)) {
              child.forEach((item) => {
                if (item && typeof item === 'object' && 'type' in item) {
                  visit(item as Node);
                }
              });
            } else if (child && typeof child === 'object' && 'type' in child) {
              visit(child as Node);
            }
          }
          scopeStack.pop();
          return;
        }
      }

      // generic recursion
      for (const key in node) {
        const child = (node as unknown as Record<string, unknown>)[key];
        if (Array.isArray(child)) {
          child.forEach((item) => {
            if (item && typeof item === 'object' && 'type' in item) {
              visit(item as Node);
            }
          });
        } else if (child && typeof child === 'object' && 'type' in child) {
          visit(child as Node);
        }
      }
    }

    visit(ast);

    return results;
  }
}

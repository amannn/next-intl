import {
  type CallExpression,
  type Identifier,
  type ImportDeclaration,
  type Module,
  type Node,
  type Program,
  type StringLiteral,
  type VariableDeclarator,
  parse,
  print
} from '@swc/core';
import type {ExtractedMessage} from '../types.js';
import ASTScope from './ASTScope.js';
import KeyGenerator from './KeyGenerator.js';
import LRUCache from './LRUCache.js';

export default class MessageExtractor {
  private isDevelopment: boolean;

  constructor(isDevelopment: boolean) {
    this.isDevelopment = isDevelopment;
  }

  private compileCache = new LRUCache<{
    messages: Array<ExtractedMessage>;
    source: string;
  }>(750);

  async processFileContent(
    absoluteFilePath: string,
    source: string
  ): Promise<{messages: Array<ExtractedMessage>; source: string}> {
    const cacheKey = source;
    const cached = this.compileCache.get(cacheKey);
    if (cached) return cached;

    // Shortcut parsing if hook is not used
    if (!source.includes('useExtracted')) {
      return {messages: [], source};
    }

    const ast = await parse(source, {
      syntax: 'typescript',
      tsx: true,
      target: 'es2022',
      decorators: true
    });

    const processResult = await this.processAST(ast, absoluteFilePath);

    const finalResult = (
      processResult.source ? processResult : {...processResult, source}
    ) as {messages: Array<ExtractedMessage>; source: string};

    this.compileCache.set(cacheKey, finalResult);
    return finalResult;
  }

  private async processAST(
    ast: Program | Module,
    filePath?: string
  ): Promise<{messages: Array<ExtractedMessage>; source?: string}> {
    const results: Array<ExtractedMessage> = [];
    let hookLocalName: string | null = null;
    const isDevelopment = this.isDevelopment;

    const scopeStack: Array<ASTScope> = [new ASTScope()];

    function currentScope() {
      return scopeStack[scopeStack.length - 1];
    }

    function visit(node: Node) {
      if (typeof node !== 'object') return;

      switch (node.type) {
        case 'ImportDeclaration': {
          const decl = node as ImportDeclaration;
          if (decl.source.value === 'next-intl') {
            for (const spec of decl.specifiers) {
              if (spec.type === 'ImportSpecifier') {
                const importedName = spec.imported?.value;
                const localName = spec.local.value;

                if (
                  importedName === 'useExtracted' ||
                  localName === 'useExtracted'
                ) {
                  hookLocalName = localName;
                  // Transform import to useTranslations
                  spec.imported = undefined;
                  spec.local.value = 'useTranslations';
                }
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
              // Transform the call to useTranslations
              (decl.init.callee as Identifier).value = 'useTranslations';
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
              const arg0 = call.arguments[0]?.expression;
              if (arg0.type === 'StringLiteral') {
                const stringLiteral = arg0 as StringLiteral;
                const messageText = stringLiteral.value;

                // Extract the message
                results.push({
                  id: KeyGenerator.generate(messageText),
                  message: messageText,
                  filePath
                });

                // Transform the string literal to the generated key
                const key = KeyGenerator.generate(messageText);
                stringLiteral.value = key;
                stringLiteral.raw = undefined;

                // Add fallback message as fourth parameter in development mode
                if (isDevelopment) {
                  // Ensure we have at least 4 arguments
                  while (call.arguments.length < 3) {
                    call.arguments.push({
                      expression: {
                        type: 'Identifier',
                        value: 'undefined',
                        optional: false,
                        // @ts-expect-error -- Seems required
                        ctxt: 1,
                        span: {
                          start: 0,
                          end: 0,
                          ctxt: 0
                        }
                      }
                    });
                  }

                  // Add fallback message
                  call.arguments.push({
                    expression: {
                      type: 'StringLiteral',
                      value: messageText,
                      raw: JSON.stringify(messageText),
                      // @ts-expect-error -- Seems required
                      ctxt: 1,
                      span: {
                        start: 0,
                        end: 0,
                        ctxt: 0
                      }
                    }
                  });
                }
              }
            }
          }
          break;
        }

        case 'FunctionDeclaration':
        case 'FunctionExpression':
        case 'ArrowFunctionExpression':
        case 'BlockStatement': {
          scopeStack.push(new ASTScope(currentScope()));
          for (const key of Object.keys(node)) {
            const child = (node as unknown as Record<string, unknown>)[key];
            if (Array.isArray(child)) {
              child.forEach((item) => {
                if (item && typeof item === 'object') {
                  if (
                    'expression' in item &&
                    typeof item.expression === 'object' &&
                    'type' in item.expression
                  ) {
                    visit(item.expression as Node);
                  } else if ('type' in item) {
                    visit(item as Node);
                  }
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

      // Generic recursion
      for (const key of Object.keys(node)) {
        const child = (node as unknown as Record<string, unknown>)[key];
        if (Array.isArray(child)) {
          child.forEach((item) => {
            if (item && typeof item === 'object') {
              if (
                'expression' in item &&
                item.expression &&
                typeof item.expression === 'object' &&
                'type' in item.expression
              ) {
                visit(item.expression as Node);
              } else if ('type' in item) {
                visit(item as Node);
              }
            }
          });
        } else if (child && typeof child === 'object' && 'type' in child) {
          visit(child as Node);
        }
      }
    }

    visit(ast);

    return {
      messages: results,
      source: (await print(ast)).code
    };
  }
}

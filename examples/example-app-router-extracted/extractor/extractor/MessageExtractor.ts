import {
  parse,
  print,
  type Program,
  type Module,
  type VariableDeclarator,
  type CallExpression,
  type ImportDeclaration,
  type StringLiteral,
  type Node,
  type Identifier
} from '@swc/core';
import type {ExtractedMessage} from '../types.ts';
import KeyGenerator from './KeyGenerator.ts';
import ASTScope from './ASTScope.ts';

export const ExtractorMode = {
  EXTRACT: 'extract',
  TRANSFORM: 'transform',
  BOTH: 'both'
} as const;

export type ExtractorMode = (typeof ExtractorMode)[keyof typeof ExtractorMode];

// TODO: This could grow too large. If we really
// need this we should use an LRU strategy.
const compileCache = new Map<
  string,
  {messages: ExtractedMessage[]; source: string}
>();

export default class MessageExtractor {
  static async processFileContent(
    absoluteFilePath: string,
    source: string,
    mode: ExtractorMode
  ): Promise<{messages: ExtractedMessage[]; source: string}> {
    const cacheKey = `${mode}:${source}`;
    if (compileCache.has(cacheKey)) {
      return compileCache.get(cacheKey)!;
    }

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

    const processResult = await MessageExtractor.processAST(
      ast,
      mode,
      absoluteFilePath
    );

    const finalResult = (
      processResult.source ? processResult : {...processResult, source}
    ) as {messages: ExtractedMessage[]; source: string};

    compileCache.set(cacheKey, finalResult);
    return finalResult;
  }

  private static async processAST(
    ast: Program | Module,
    mode: ExtractorMode,
    filePath?: string
  ): Promise<{messages: ExtractedMessage[]; source?: string}> {
    const results: ExtractedMessage[] = [];
    let hookLocalName: string | null = null;

    const scopeStack: ASTScope[] = [new ASTScope()];

    const currentScope = () => {
      return scopeStack[scopeStack.length - 1];
    };

    function shouldTransform(): boolean {
      return mode === ExtractorMode.TRANSFORM || mode === ExtractorMode.BOTH;
    }

    function shouldCollect(): boolean {
      return mode === ExtractorMode.EXTRACT || mode === ExtractorMode.BOTH;
    }

    function visit(node: Node) {
      if (!node || typeof node !== 'object') return;

      switch (node.type) {
        case 'ImportDeclaration': {
          const decl = node as ImportDeclaration;
          if (decl.source.value === 'next-intl') {
            for (const spec of decl.specifiers ?? []) {
              if (spec.type === 'ImportSpecifier') {
                const importedName = spec.imported?.value;
                const localName = spec.local.value;

                if (
                  importedName === 'useExtracted' ||
                  localName === 'useExtracted'
                ) {
                  hookLocalName = localName;
                  if (shouldTransform()) {
                    // Transform import to useTranslations
                    spec.imported = undefined;
                    spec.local.value = 'useTranslations';
                  }
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
              if (shouldTransform()) {
                // Transform the call to useTranslations
                (decl.init.callee as Identifier).value = 'useTranslations';
              }
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
                const messageText = stringLiteral.value;

                if (shouldCollect()) {
                  results.push({
                    id: KeyGenerator.generate(messageText),
                    message: messageText,
                    filePath: filePath
                  });
                }

                if (shouldTransform()) {
                  // Transform the string literal to the generated key
                  const key = KeyGenerator.generate(messageText);
                  stringLiteral.value = key;
                  stringLiteral.raw = undefined;
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

      // Generic recursion
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

    return {
      messages: results,
      source: shouldTransform() ? (await print(ast, {})).code : undefined
    };
  }
}

import path from 'path';
import {
  type CallExpression,
  type Identifier,
  type ImportDeclaration,
  type MemberExpression,
  type Module,
  type Node,
  type ObjectExpression,
  type Program,
  type StringLiteral,
  type TemplateLiteral,
  type VariableDeclarator,
  parse,
  print
} from '@swc/core';
import {warn} from '../../utils.js';
import type {ExtractedMessage} from '../types.js';
import ASTScope from './ASTScope.js';
import KeyGenerator from './KeyGenerator.js';
import LRUCache from './LRUCache.js';

export default class MessageExtractor {
  private static readonly NAMESPACE_SEPARATOR = '.';

  private isDevelopment: boolean;
  private compileCache = new LRUCache<{
    messages: Array<ExtractedMessage>;
    source: string;
  }>(750);

  constructor(isDevelopment: boolean) {
    this.isDevelopment = isDevelopment;
  }

  async processFileContent(
    absoluteFilePath: string,
    source: string
  ): Promise<{messages: Array<ExtractedMessage>; source: string}> {
    const cacheKey = source;
    const cached = this.compileCache.get(cacheKey);
    if (cached) return cached;

    // Shortcut parsing if hook is not used
    if (!source.includes('useExtracted') && !source.includes('getExtracted')) {
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
    let hookType: 'useTranslations' | 'getTranslations' | null = null;
    const isDevelopment = this.isDevelopment;

    const scopeStack: Array<ASTScope> = [new ASTScope()];

    function currentScope() {
      return scopeStack[scopeStack.length - 1];
    }

    function createUndefinedArgument() {
      return {
        expression: {
          type: 'Identifier' as const,
          value: 'undefined',
          optional: false,
          ctxt: 1,
          span: {
            start: 0,
            end: 0,
            ctxt: 0
          }
        }
      };
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
                  hookType = 'useTranslations';
                  // Transform import to useTranslations
                  spec.imported = undefined;
                  spec.local.value = 'useTranslations';
                }
              }
            }
          } else if (decl.source.value === 'next-intl/server') {
            for (const spec of decl.specifiers) {
              if (spec.type === 'ImportSpecifier') {
                const importedName = spec.imported?.value;
                const localName = spec.local.value;

                if (
                  importedName === 'getExtracted' ||
                  localName === 'getExtracted'
                ) {
                  hookLocalName = localName;
                  hookType = 'getTranslations';
                  // Transform import to getTranslations
                  if (spec.imported) {
                    spec.imported.value = 'getTranslations';
                  }
                  spec.local.value = 'getTranslations';
                }
              }
            }
          }
          break;
        }

        case 'VariableDeclarator': {
          const decl = node as VariableDeclarator;
          let callExpr = null;

          // Handle direct CallExpression: const t = useExtracted();
          if (
            decl.init?.type === 'CallExpression' &&
            decl.init.callee.type === 'Identifier' &&
            decl.init.callee.value === hookLocalName
          ) {
            callExpr = decl.init;
          }
          // Handle AwaitExpression: const t = await getExtracted();
          else if (
            decl.init?.type === 'AwaitExpression' &&
            decl.init.argument.type === 'CallExpression' &&
            decl.init.argument.callee.type === 'Identifier' &&
            decl.init.argument.callee.value === hookLocalName
          ) {
            callExpr = decl.init.argument;
          }

          if (callExpr && decl.id.type === 'Identifier') {
            // Extract namespace from first argument if present
            let namespace: string | undefined;
            if (callExpr.arguments.length > 0) {
              const firstArg = callExpr.arguments[0].expression;
              if (firstArg.type === 'StringLiteral') {
                namespace = (firstArg as StringLiteral).value;
              }
            }

            currentScope().define(decl.id.value, 'translator', namespace);
            // Transform the call based on the hook type
            if (hookType) {
              (callExpr.callee as Identifier).value = hookType;
            }
          }
          break;
        }

        case 'CallExpression': {
          const call = node as CallExpression;
          let isTranslatorCall = false;
          let namespace: string | undefined;

          // Handle Identifier case: t("message")
          if (call.callee.type === 'Identifier') {
            const name = call.callee.value;
            const resolved = currentScope().lookup(name);
            isTranslatorCall = resolved?.kind === 'translator';
            namespace = resolved?.namespace;
          }
          // Handle MemberExpression case: t.rich, t.markup, or t.has
          else if (call.callee.type === 'MemberExpression') {
            const memberExpr = call.callee as MemberExpression;
            if (
              memberExpr.object.type === 'Identifier' &&
              memberExpr.property.type === 'Identifier'
            ) {
              const objectName = memberExpr.object.value;
              const propertyName = memberExpr.property.value;
              const resolved = currentScope().lookup(objectName);
              isTranslatorCall =
                resolved?.kind === 'translator' &&
                (propertyName === 'rich' ||
                  propertyName === 'markup' ||
                  propertyName === 'has');
              namespace = resolved?.namespace;
            }
          }

          if (isTranslatorCall) {
            const arg0 = call.arguments[0]?.expression;
            let messageText: string | null = null;
            let explicitId: string | null = null;
            let valuesNode: Node | null = null;
            let formatsNode: Node | null = null;

            function warnDynamicExpression(expressionNode: Node) {
              const hasSpan =
                'span' in expressionNode &&
                expressionNode.span &&
                typeof expressionNode.span === 'object' &&
                'start' in expressionNode.span;
              const location =
                filePath && hasSpan ? `${path.basename(filePath)}` : undefined;

              warn(
                (location ? `${location}: ` : '') +
                  'Cannot extract message from dynamic expression, messages need to be statically analyzable. If you need to provide runtime values, pass them as a separate argument.'
              );
            }

            function extractStaticString(value: Node): string | null {
              if (value.type === 'StringLiteral') {
                return (value as StringLiteral).value;
              } else if (value.type === 'TemplateLiteral') {
                const templateLiteral = value as TemplateLiteral;
                // Only handle simple template literals without expressions
                if (
                  templateLiteral.expressions.length === 0 &&
                  templateLiteral.quasis.length === 1
                ) {
                  return (
                    templateLiteral.quasis[0].cooked ||
                    templateLiteral.quasis[0].raw
                  );
                }
              }
              return null;
            }

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (arg0) {
              // Handle object syntax: t({id: 'key', message: 'text'})
              if (arg0.type === 'ObjectExpression') {
                const objectExpression = arg0 as ObjectExpression;
                // Look for id, message, values, and formats properties
                for (const prop of objectExpression.properties) {
                  if (prop.type === 'KeyValueProperty') {
                    const key = prop.key;
                    if (key.type === 'Identifier' && key.value === 'id') {
                      const staticId = extractStaticString(prop.value);
                      if (staticId !== null) {
                        explicitId = staticId;
                      }
                    } else if (
                      key.type === 'Identifier' &&
                      key.value === 'message'
                    ) {
                      const staticMessage = extractStaticString(prop.value);
                      if (staticMessage != null) {
                        messageText = staticMessage;
                      } else {
                        warnDynamicExpression(prop.value);
                      }
                    } else if (
                      key.type === 'Identifier' &&
                      key.value === 'values'
                    ) {
                      valuesNode = prop.value;
                    } else if (
                      key.type === 'Identifier' &&
                      key.value === 'formats'
                    ) {
                      formatsNode = prop.value;
                    }
                  }
                }
              }
              // Handle string syntax: t('text') or t(`text`)
              else {
                const staticString = extractStaticString(arg0);
                if (staticString != null) {
                  messageText = staticString;
                } else {
                  // Dynamic expression (Identifier, CallExpression, BinaryExpression, etc.)
                  warnDynamicExpression(arg0);
                }
              }
            }

            if (messageText) {
              const callKey = explicitId || KeyGenerator.generate(messageText);
              const fullKey = namespace
                ? [namespace, callKey].join(
                    MessageExtractor.NAMESPACE_SEPARATOR
                  )
                : callKey;

              results.push({
                id: fullKey,
                message: messageText,
                references: filePath ? [{path: filePath}] : []
              });

              // Transform the argument based on type (use baseKey for the code)
              if (arg0.type === 'StringLiteral') {
                (arg0 as StringLiteral).value = callKey;
                (arg0 as StringLiteral).raw = undefined;
              } else if (arg0.type === 'TemplateLiteral') {
                // Replace template literal with string literal
                Object.assign(arg0, {
                  type: 'StringLiteral',
                  value: callKey,
                  raw: undefined
                } as StringLiteral);
              } else if (arg0.type === 'ObjectExpression') {
                // Transform object expression to individual parameters
                // Replace the object with the key as first argument
                Object.assign(arg0, {
                  type: 'StringLiteral',
                  value: callKey,
                  raw: undefined
                } as StringLiteral);

                // Add values as second argument if present
                if (valuesNode) {
                  if (call.arguments.length < 2) {
                    call.arguments.push({
                      // @ts-expect-error -- Node type compatible with Expression
                      expression: valuesNode
                    });
                  } else {
                    // @ts-expect-error -- Node type compatible with Expression
                    call.arguments[1].expression = valuesNode;
                  }
                }

                // Add formats as third argument if present
                if (formatsNode) {
                  // Ensure we have a second argument (values or undefined)
                  while (call.arguments.length < 2) {
                    call.arguments.push(createUndefinedArgument());
                  }
                  if (call.arguments.length < 3) {
                    // Append argument
                    call.arguments.push({
                      // @ts-expect-error -- Node type compatible with Expression
                      expression: formatsNode
                    });
                  } else {
                    // Replace argument
                    // @ts-expect-error -- Node type compatible with Expression
                    call.arguments[2].expression = formatsNode;
                  }
                }
              }

              // Check if this is a t.has call (which doesn't need fallback)
              const isHasCall =
                call.callee.type === 'MemberExpression' &&
                (call.callee as MemberExpression).property.type ===
                  'Identifier' &&
                ((call.callee as MemberExpression).property as Identifier)
                  .value === 'has';

              // Add fallback message as fourth parameter in development mode (except for t.has)
              if (isDevelopment && !isHasCall) {
                // Ensure we have at least 4 arguments
                while (call.arguments.length < 3) {
                  call.arguments.push(createUndefinedArgument());
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

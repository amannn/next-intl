import {promises as fs} from 'fs';
import {parse} from '@babel/parser';
import traverse from '@babel/traverse';
import type {ExtractedMessage} from './types.ts';
import {KeyGenerator} from './KeyGenerator.ts';

export class MessageExtractor {
  /**
   * Extract messages from a file by analyzing its AST
   */
  async extractFromFile(filePath: string): Promise<Array<ExtractedMessage>> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return this.extractFromContent(content, filePath);
    } catch (error) {
      console.error(`❌ Failed to read file ${filePath}: ${error}`);
      return [];
    }
  }

  /**
   * Extract messages from file content
   */
  async extractFromContent(
    content: string,
    filePath: string
  ): Promise<Array<ExtractedMessage>> {
    const messages: Array<ExtractedMessage> = [];

    try {
      const ast = parse(content, {
        sourceType: 'module',
        plugins: [
          'typescript',
          'jsx',
          'decorators-legacy',
          'classProperties',
          'objectRestSpread',
          'functionBind',
          'exportDefaultFrom',
          'exportNamespaceFrom',
          'dynamicImport',
          'nullishCoalescingOperator',
          'optionalChaining'
        ]
      }) as any;

      // @ts-expect-error -- Somehow necessary
      const traverseFn = (traverse.default || traverse) as typeof traverse;

      traverseFn(ast, {
        CallExpression: (p) => {
          const extractedMessage = this.extractFromCallExpression(p, filePath);
          if (extractedMessage) {
            messages.push(extractedMessage);
          }
        }
      });
    } catch (error) {
      console.error(`❌ Failed to parse ${filePath}: ${error}`);
    }

    return messages;
  }

  /**
   * Extract message from a call expression (t('message') or t({...}))
   */
  private extractFromCallExpression(
    path: {
      node: {
        type: 'CallExpression';
        arguments: Array<unknown>;
        loc?: {start?: {line?: number; column?: number}} | null | undefined;
      };
    },
    filePath: string
  ): ExtractedMessage | null {
    const node = path.node;

    // Check if this is a call to the translation function
    if (!this.isTranslationCall(node)) {
      return null;
    }

    const args = node.arguments;
    if (args.length === 0) {
      return null;
    }

    const firstArg = args[0] as Record<string, unknown> | undefined;

    // Handle string literal: t('Hello world')
    if (this.isStringLiteral(firstArg)) {
      return this.createMessage(firstArg.value as string, filePath, node.loc);
    }

    // Handle object literal: t({ message: 'Hello', description: 'Greeting' })
    if (this.isObjectExpression(firstArg)) {
      return this.extractFromObjectExpression(
        firstArg as {properties: Array<unknown>},
        filePath,
        node.loc
      );
    }

    return null;
  }

  /**
   * Check if this is a call to the translation function
   */
  private isTranslationCall(node: {type: string}): boolean {
    // For now, we'll assume any function call is a translation call
    // In the future, we could be more specific and check for useExtracted
    return node.type === 'CallExpression';
  }

  private isStringLiteral(
    node: unknown
  ): node is {type: string; value: string} {
    return (
      !!node &&
      typeof (node as Record<string, unknown>).type === 'string' &&
      (node as Record<string, unknown>).type === 'StringLiteral' &&
      typeof (node as Record<string, unknown>).value === 'string'
    );
  }

  private isObjectExpression(
    node: unknown
  ): node is {type: string; properties: Array<unknown>} {
    return (
      !!node &&
      typeof (node as Record<string, unknown>).type === 'string' &&
      (node as Record<string, unknown>).type === 'ObjectExpression' &&
      Array.isArray((node as Record<string, unknown>).properties)
    );
  }

  /**
   * Extract message from object expression
   */
  private extractFromObjectExpression(
    objectExpression: {properties: Array<unknown>},
    filePath: string,
    location: {start?: {line?: number; column?: number}} | null | undefined
  ): ExtractedMessage | null {
    let message = '';
    let description = '';
    let id = '';
    let namespace = '';

    for (const propertyUnknown of objectExpression.properties) {
      const property = propertyUnknown as Record<string, unknown>;
      if (property.type !== 'ObjectProperty') continue;
      const key = property.key as Record<string, unknown>;
      if (key?.type !== 'Identifier' || typeof key?.name !== 'string') continue;
      const keyName = key.name as string;
      const value = property.value as Record<string, unknown>;
      if (value?.type !== 'StringLiteral' || typeof value?.value !== 'string')
        continue;
      const stringValue = value.value as string;
      switch (keyName) {
        case 'message':
          message = stringValue;
          break;
        case 'description':
          description = stringValue;
          break;
        case 'id':
          id = stringValue;
          break;
        case 'namespace':
          namespace = stringValue;
          break;
      }
    }

    if (!message) {
      return null;
    }

    return this.createMessage(message, filePath, location, {
      description,
      id,
      namespace
    });
  }

  /**
   * Create an ExtractedMessage object
   */
  private createMessage(
    message: string,
    filePath: string,
    location: {start?: {line?: number; column?: number}} | null | undefined,
    options: {
      description?: string;
      id?: string;
      namespace?: string;
    } = {}
  ): ExtractedMessage {
    const key = options.id || KeyGenerator.generate(message);

    return {
      id: key,
      message,
      description: options.description,
      namespace: options.namespace,
      filePath,
      line: location?.start?.line || 0,
      column: location?.start?.column || 0
    };
  }
}

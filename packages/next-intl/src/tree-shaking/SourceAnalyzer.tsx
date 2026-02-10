import fs from 'fs/promises';
import {createHash} from 'node:crypto';
import {parse} from '@swc/core';

const TRANSLATOR_METHODS = new Set(['has', 'markup', 'raw', 'rich']);
const SUPPORTED_EXTENSIONS = new Set([
  '.cjs',
  '.js',
  '.jsx',
  '.mjs',
  '.ts',
  '.tsx'
]);

type TranslationUse = {
  fullNamespace?: boolean;
  key?: string;
  namespace?: string;
};

type TranslatorKind = 'extracted' | 'translations';

type TranslatorInfo = {
  kind: TranslatorKind;
  namespace: string | null | undefined;
};

type FileAnalysis = {
  requiresAllMessages: boolean;
  hasUseClient: boolean;
  hasUseServer: boolean;
  imports: Array<string>;
  translations: Array<TranslationUse>;
};

type HookAliasMap = Map<string, TranslatorKind>;

function isSupportedSourceFile(filePath: string): boolean {
  if (filePath.endsWith('.d.ts')) return false;
  const dotIndex = filePath.lastIndexOf('.');
  if (dotIndex === -1) return false;
  return SUPPORTED_EXTENSIONS.has(filePath.slice(dotIndex));
}

function readFileIfExists(filePath: string): Promise<string | undefined> {
  return fs.readFile(filePath, 'utf8').catch(() => undefined);
}

function hasDirective(ast: any, directive: string): boolean {
  const body = ast.body ?? [];
  return body.some(
    (item: any) =>
      item.type === 'ExpressionStatement' &&
      item.expression?.type === 'StringLiteral' &&
      item.expression.value === directive
  );
}

function containsDirective(ast: any, directive: string): boolean {
  let found = false;

  function walk(node: any) {
    if (!node || typeof node !== 'object' || found) return;
    if (
      node.type === 'ExpressionStatement' &&
      node.expression?.type === 'StringLiteral' &&
      node.expression.value === directive
    ) {
      found = true;
      return;
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        value.forEach(walk);
      } else if (value && typeof value === 'object') {
        walk(value);
      }
    }
  }

  walk(ast);
  return found;
}

function collectImports(ast: any): Array<string> {
  const imports: Array<string> = [];

  for (const node of ast.body ?? []) {
    if (node.type === 'ImportDeclaration' && node.source?.value) {
      imports.push(node.source.value as string);
      continue;
    }
    if (
      (node.type === 'ExportAllDeclaration' ||
        node.type === 'ExportDeclaration' ||
        node.type === 'ExportNamedDeclaration') &&
      node.source?.value
    ) {
      imports.push(node.source.value as string);
    }
  }

  function walk(node: any) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node.type === 'CallExpression' && node.callee?.type === 'Import') {
      const arg = node.arguments?.[0]?.expression;
      const spec = getStaticString(arg);
      if (spec) imports.push(spec);
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        value.forEach(walk);
      } else if (value && typeof value === 'object') {
        walk(value);
      }
    }
  }

  walk(ast.body);

  return imports;
}

function collectHookAliases(ast: any): HookAliasMap {
  const aliases: HookAliasMap = new Map();

  for (const node of ast.body ?? []) {
    if (node.type !== 'ImportDeclaration') continue;
    const source = node.source?.value;
    if (source !== 'next-intl' && source !== 'next-intl/react') continue;
    for (const specifier of node.specifiers ?? []) {
      if (specifier.type !== 'ImportSpecifier') continue;
      const imported = specifier.imported;
      const local = specifier.local?.value;
      const importedName =
        imported?.type === 'Identifier'
          ? imported.value
          : imported?.type === 'StringLiteral'
            ? imported.value
            : local;
      if (!importedName || !local) continue;
      if (importedName === 'useTranslations') {
        aliases.set(local, 'translations');
      }
      if (importedName === 'useExtracted') {
        aliases.set(local, 'extracted');
      }
    }
  }

  return aliases;
}

function getStaticString(node: any): string | undefined {
  if (!node) return undefined;
  if (node.type === 'StringLiteral') {
    return node.value as string;
  }
  if (node.type === 'TemplateLiteral' || node.type === 'Tpl') {
    const expressions = node.expressions ?? node.exprs;
    if (expressions?.length) return undefined;
    const quasis = node.quasis ?? [];
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

function getNamespaceFromArgs(args: Array<any>): string | null | undefined {
  const firstArg = args[0]?.expression;
  if (!firstArg) return undefined;
  const direct = getStaticString(firstArg);
  if (direct != null) return direct;
  if (firstArg.type !== 'ObjectExpression') {
    return null;
  }

  for (const prop of firstArg.properties ?? []) {
    if (prop.type !== 'KeyValueProperty') continue;
    const key =
      prop.key.type === 'Identifier'
        ? prop.key.value
        : prop.key.type === 'StringLiteral'
          ? prop.key.value
          : undefined;
    if (key !== 'namespace') continue;
    const value = (prop.value as any)?.expression ?? prop.value;
    const parsed = getStaticString(value);
    return parsed ?? null;
  }

  return undefined;
}

function getTranslatorKind(
  name: string,
  aliases: HookAliasMap
): TranslatorKind | undefined {
  const fromAlias = aliases.get(name);
  if (fromAlias) return fromAlias;
  if (name === 'useTranslations') return 'translations';
  if (name === 'useExtracted') return 'extracted';
  return undefined;
}

function getTranslatorCall(init: any, aliases: HookAliasMap): any | undefined {
  if (!init) return undefined;
  if (init.type === 'CallExpression') {
    const callee = init.callee;
    if (callee?.type !== 'Identifier') return undefined;
    const kind = getTranslatorKind(callee.value as string, aliases);
    if (!kind) return undefined;
    return {call: init, kind};
  }
  if (init.type === 'AwaitExpression') {
    const awaited = init.argument ?? init.arg;
    if (awaited?.type !== 'CallExpression') return undefined;
    const callee = awaited.callee;
    if (callee?.type !== 'Identifier') return undefined;
    const kind = getTranslatorKind(callee.value as string, aliases);
    if (!kind) return undefined;
    return {call: awaited, kind};
  }
  return undefined;
}

function generateExtractedKey(message: string): string {
  const hash = createHash('sha512').update(message).digest('base64');
  return hash.slice(0, 6);
}

function getExtractedKey(arg: any): string | null {
  if (!arg) return null;
  if (arg.type === 'ObjectExpression') {
    let explicitId: string | undefined;
    let messageText: string | undefined;
    for (const prop of arg.properties ?? []) {
      if (prop.type !== 'KeyValueProperty') continue;
      const key =
        prop.key.type === 'Identifier'
          ? prop.key.value
          : prop.key.type === 'StringLiteral'
            ? prop.key.value
            : undefined;
      const value = (prop.value as any)?.expression ?? prop.value;
      if (key === 'id') {
        const staticId = getStaticString(value);
        if (staticId) explicitId = staticId;
      }
      if (key === 'message') {
        const staticMessage = getStaticString(value);
        if (staticMessage) messageText = staticMessage;
      }
    }
    if (explicitId) return explicitId;
    if (messageText) return generateExtractedKey(messageText);
    return null;
  }

  const message = getStaticString(arg);
  if (!message) return null;
  return generateExtractedKey(message);
}

function addTranslationUse(
  translations: Array<TranslationUse>,
  requiresAllMessagesRef: {value: boolean},
  translator: TranslatorInfo,
  arg0: any
) {
  const namespace = translator.namespace;

  if (translator.kind === 'translations') {
    const key = getStaticString(arg0);
    if (namespace === null) {
      requiresAllMessagesRef.value = true;
      return;
    }
    if (!key) {
      if (namespace != null) {
        translations.push({fullNamespace: true, namespace});
        return;
      }
      requiresAllMessagesRef.value = true;
      return;
    }
    translations.push({key, namespace: namespace ?? undefined});
    return;
  }

  const extractedKey = getExtractedKey(arg0);
  if (!extractedKey) {
    if (namespace != null) {
      translations.push({fullNamespace: true, namespace});
      return;
    }
    requiresAllMessagesRef.value = true;
    return;
  }
  if (namespace === null) {
    requiresAllMessagesRef.value = true;
    return;
  }
  translations.push({key: extractedKey, namespace: namespace ?? undefined});
}

function collectTranslations(ast: any): {
  requiresAllMessages: boolean;
  translations: Array<TranslationUse>;
} {
  const translations: Array<TranslationUse> = [];
  const requiresAllMessagesRef = {value: false};
  const aliases = collectHookAliases(ast);
  const scopeStack: Array<Map<string, TranslatorInfo>> = [new Map()];

  function pushScope() {
    scopeStack.push(new Map());
  }

  function popScope() {
    scopeStack.pop();
  }

  function defineTranslator(name: string, info: TranslatorInfo) {
    scopeStack[scopeStack.length - 1].set(name, info);
  }

  function lookupTranslator(name: string): TranslatorInfo | undefined {
    for (let i = scopeStack.length - 1; i >= 0; i--) {
      const found = scopeStack[i].get(name);
      if (found) return found;
    }
    return undefined;
  }

  function isScopeNode(node: any): boolean {
    return (
      node.type === 'ArrowFunctionExpression' ||
      node.type === 'BlockStatement' ||
      node.type === 'CatchClause' ||
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression'
    );
  }

  function walk(node: any) {
    if (!node || typeof node !== 'object') return;
    const scoped = isScopeNode(node);
    if (scoped) pushScope();

    if (node.type === 'VariableDeclarator') {
      const id =
        node.id?.type === 'Identifier' ? (node.id.value as string) : undefined;
      const init = node.init;
      if (id && init) {
        const hookCall = getTranslatorCall(init, aliases);
        if (hookCall) {
          const namespace = getNamespaceFromArgs(hookCall.call.arguments ?? []);
          defineTranslator(id, {kind: hookCall.kind, namespace});
        }
      }
    }

    if (node.type === 'CallExpression') {
      let translatorName: string | undefined;
      if (node.callee?.type === 'Identifier') {
        translatorName = node.callee.value;
      } else if (
        node.callee?.type === 'MemberExpression' &&
        node.callee.object?.type === 'Identifier'
      ) {
        const prop = node.callee.property;
        if (
          prop?.type === 'Identifier' &&
          TRANSLATOR_METHODS.has(prop.value as string)
        ) {
          translatorName = node.callee.object.value as string;
        }
      }

      if (translatorName) {
        const translator = lookupTranslator(translatorName);
        if (translator) {
          const arg0 = node.arguments?.[0]?.expression;
          addTranslationUse(
            translations,
            requiresAllMessagesRef,
            translator,
            arg0
          );
        }
      }
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        value.forEach(walk);
      } else if (value && typeof value === 'object') {
        walk(value);
      }
    }

    if (scoped) popScope();
  }

  walk(ast.body);

  return {requiresAllMessages: requiresAllMessagesRef.value, translations};
}

export default class SourceAnalyzer {
  private cache = new Map<string, FileAnalysis>();

  public clearCache(filePaths: Array<string>) {
    for (const filePath of filePaths) {
      this.cache.delete(filePath);
    }
  }

  public async analyzeFile(filePath: string): Promise<FileAnalysis> {
    const cached = this.cache.get(filePath);
    if (cached) return cached;

    const empty: FileAnalysis = {
      requiresAllMessages: false,
      hasUseClient: false,
      hasUseServer: false,
      imports: [],
      translations: []
    };

    if (!isSupportedSourceFile(filePath)) {
      this.cache.set(filePath, empty);
      return empty;
    }

    const source = await readFileIfExists(filePath);
    if (!source) {
      this.cache.set(filePath, empty);
      return empty;
    }

    let ast: any;
    try {
      ast = await parse(source, {
        comments: false,
        syntax: 'typescript',
        target: 'esnext',
        tsx: true
      });
    } catch {
      this.cache.set(filePath, empty);
      return empty;
    }

    const {requiresAllMessages, translations} = collectTranslations(ast);

    const analysis: FileAnalysis = {
      requiresAllMessages,
      hasUseClient: hasDirective(ast, 'use client'),
      hasUseServer: containsDirective(ast, 'use server'),
      imports: collectImports(ast),
      translations
    };

    this.cache.set(filePath, analysis);
    return analysis;
  }
}

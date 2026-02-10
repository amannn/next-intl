import fs from 'fs/promises';
import path from 'path';
import {parse} from '@swc/core';
import {
  type Manifest,
  type ManifestEntry,
  createEmptyManifest
} from './Manifest.js';
import loadDependencyTree from './dependencyTreeLoader.js';

const ENTRY_NAMES = new Set([
  'page',
  'layout',
  'template',
  'error',
  'loading',
  'not-found',
  'default'
]);

type TranslationUse = {
  namespace?: string | null;
  key?: string;
  fullNamespace?: boolean;
};

type FileInfo = {
  hasUseClient: boolean;
  hasUseServer: boolean;
  translations: Array<TranslationUse>;
};

const fileInfoCache = new Map<string, FileInfo>();
const importsCache = new Map<string, Array<string>>();

async function readFileIfExists(filePath: string) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return undefined;
  }
}

function hasUseClientDirective(ast: any) {
  const body = ast.body ?? [];
  return body.some(
    (item: any) =>
      item.type === 'ExpressionStatement' &&
      item.expression?.type === 'StringLiteral' &&
      item.expression.value === 'use client'
  );
}

function containsUseServer(ast: any) {
  let found = false;

  function walk(node: any) {
    if (!node || typeof node !== 'object' || found) return;
    if (
      node.type === 'ExpressionStatement' &&
      node.expression?.type === 'StringLiteral' &&
      node.expression.value === 'use server'
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

function getNamespaceFromCall(args: Array<any>): string | null | undefined {
  const first = args[0]?.expression;
  if (!first) return undefined;
  if (first.type === 'StringLiteral') return first.value as string;
  if (first.type === 'ObjectExpression') {
    for (const prop of first.properties ?? []) {
      if (prop.type !== 'KeyValueProperty') continue;
      const key =
        prop.key.type === 'Identifier'
          ? prop.key.value
          : prop.key.type === 'StringLiteral'
            ? prop.key.value
            : undefined;
      if (key === 'namespace') {
        const val = (prop.value as any)?.expression ?? prop.value;
        if (val?.type === 'StringLiteral') return val.value as string;
        return null;
      }
    }
  }
  return null;
}

function collectTranslations(ast: any): Array<TranslationUse> {
  const translators = new Map<string, string | null | undefined>();
  const results: Array<TranslationUse> = [];

  function visit(node: any) {
    if (!node || typeof node !== 'object') return;
    switch (node.type) {
      case 'VariableDeclarator': {
        const id =
          node.id?.type === 'Identifier'
            ? (node.id.value as string)
            : undefined;
        const init = node.init;
        if (
          id &&
          init?.type === 'CallExpression' &&
          init.callee?.type === 'Identifier' &&
          (init.callee.value === 'useTranslations' ||
            init.callee.value === 'useExtracted')
        ) {
          const ns = getNamespaceFromCall(init.arguments ?? []);
          translators.set(id, ns);
        }
        break;
      }
      case 'CallExpression': {
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
            ['rich', 'markup', 'has', 'raw'].includes(prop.value as string)
          ) {
            translatorName = node.callee.object.value as string;
          }
        }

        if (translatorName && translators.has(translatorName)) {
          const ns = translators.get(translatorName);
          const arg0 = node.arguments?.[0]?.expression;
          if (arg0?.type === 'StringLiteral') {
            results.push({namespace: ns, key: arg0.value as string});
          } else {
            results.push({namespace: ns, fullNamespace: true});
          }
        }
        break;
      }
      default:
        break;
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        value.forEach(visit);
      } else if (value && typeof value === 'object' && 'type' in value) {
        visit(value);
      }
    }
  }

  visit(ast);
  return results;
}

async function parseFile(filePath: string): Promise<any | undefined> {
  const source = await readFileIfExists(filePath);
  if (!source) return undefined;
  try {
    return await parse(source, {
      syntax: 'typescript',
      tsx: true,
      target: 'esnext',
      comments: false
    });
  } catch {
    return undefined;
  }
}

async function getFileInfo(filePath: string): Promise<FileInfo> {
  const cached = fileInfoCache.get(filePath);
  if (cached) return cached;

  const ast = await parseFile(filePath);
  if (!ast) {
    const empty: FileInfo = {
      hasUseClient: false,
      hasUseServer: false,
      translations: []
    };
    fileInfoCache.set(filePath, empty);
    return empty;
  }

  const info: FileInfo = {
    hasUseClient: hasUseClientDirective(ast),
    hasUseServer: containsUseServer(ast),
    translations: collectTranslations(ast)
  };

  fileInfoCache.set(filePath, info);
  return info;
}

function hasNextIntlClientProvider(source: string, ast: any): boolean {
  // Fast-path string check; keeps logic simple even if JSX parsing changes.
  if (/<\s*NextIntlClientProvider\b/.test(source)) {
    return true;
  }

  let found = false;

  function walk(node: any) {
    if (!node || typeof node !== 'object' || found) return;

    if (node.type === 'JSXElement') {
      const name = node.openingElement?.name;
      if (
        name?.type === 'Identifier' &&
        name.value === 'NextIntlClientProvider'
      ) {
        found = true;
        return;
      }
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
      (node.type === 'ExportDeclaration' ||
        node.type === 'ExportAllDeclaration') &&
      node.source?.value
    ) {
      imports.push(node.source.value as string);
      continue;
    }
  }

  function walk(n: any) {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) {
      n.forEach(walk);
      return;
    }
    if (n.type === 'CallExpression' && n.callee?.type === 'Import') {
      const arg = n.arguments?.[0]?.expression;
      if (arg?.type === 'StringLiteral') {
        imports.push(arg.value as string);
      }
    }
    Object.values(n).forEach(walk);
  }

  walk(ast.body);

  return imports;
}

function flattenDependencyTree(tree: Record<string, any> | null) {
  if (!tree) return null;

  const map = new Map<string, Set<string>>();

  function ensure(key: string) {
    if (!map.has(key)) {
      map.set(key, new Set());
    }
  }

  function walk(parent: string, children?: Record<string, any>) {
    if (!children) return;

    for (const [child, nested] of Object.entries(children)) {
      ensure(parent);
      ensure(child);
      map.get(parent)!.add(child);
      walk(child, nested as Record<string, any>);
    }
  }

  for (const [root, children] of Object.entries(tree)) {
    ensure(root);
    walk(root, children as Record<string, any>);
  }

  return map;
}

function ensureManifestEntry(
  manifest: Manifest,
  segmentId: string,
  hasProvider?: boolean
): ManifestEntry {
  const existing = manifest[segmentId];
  if (existing) {
    if (hasProvider && !existing.hasProvider) {
      existing.hasProvider = true;
    }
    return existing;
  }

  const entry: ManifestEntry = {
    hasProvider: Boolean(hasProvider),
    namespaces: {}
  };
  manifest[segmentId] = entry;
  return entry;
}

function resolveWithExtensions(base: string) {
  const candidates: Array<string> = [];
  const exts = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
  for (const ext of exts) {
    candidates.push(`${base}${ext}`);
  }
  for (const ext of exts) {
    candidates.push(path.join(base, `index${ext}`));
  }
  return candidates;
}

async function resolveImport(
  specifier: string,
  fromFile: string,
  projectRoot: string
): Promise<string | null> {
  const fromDir = path.dirname(fromFile);
  const tryPaths: Array<string> = [];

  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    const base = path.resolve(fromDir, specifier);
    tryPaths.push(base);
    tryPaths.push(...resolveWithExtensions(base));
  } else if (specifier.startsWith('@/')) {
    const base = path.resolve(projectRoot, 'src', specifier.slice(2));
    tryPaths.push(base);
    tryPaths.push(...resolveWithExtensions(base));
  } else {
    return null;
  }

  for (const candidate of tryPaths) {
    try {
      const stats = await fs.stat(candidate);
      if (stats.isFile()) return candidate;
    } catch {
      continue;
    }
  }

  return null;
}

async function getImports(
  filePath: string,
  projectRoot: string
): Promise<Array<string>> {
  const cached = importsCache.get(filePath);
  if (cached) return cached;

  const ast = await parseFile(filePath);
  if (!ast) {
    importsCache.set(filePath, []);
    return [];
  }

  const specs = collectImports(ast);
  const resolved: Array<string> = [];
  for (const spec of specs) {
    const resolvedPath = await resolveImport(spec, filePath, projectRoot);
    if (resolvedPath) resolved.push(resolvedPath);
  }

  importsCache.set(filePath, resolved);
  return resolved;
}

function stripRouteGroup(segment: string) {
  if (segment.startsWith('(') || segment.startsWith('@')) {
    return null;
  }
  return segment;
}

function getSegmentId(filePath: string, appDir: string) {
  const relativeDir = path.relative(appDir, path.dirname(filePath));
  const parts = relativeDir.split(path.sep).filter(Boolean);
  const filtered = parts
    .map(stripRouteGroup)
    .filter((part): part is string => Boolean(part));
  return '/' + filtered.join('/');
}

async function findEntryFiles(appDir: string): Promise<Array<string>> {
  const entries: Array<string> = [];
  async function walk(dir: string) {
    const dirents = await fs.readdir(dir, {withFileTypes: true});
    for (const entry of dirents) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
        continue;
      }
      const ext = path.extname(entry.name);
      if (!['.ts', '.tsx', '.js', '.jsx', '.mdx'].includes(ext)) continue;
      const base = path.basename(entry.name, ext);
      if (ENTRY_NAMES.has(base)) {
        entries.push(entryPath);
      }
    }
  }
  await walk(appDir);
  return entries;
}

function splitPath(input: string): Array<string> {
  return input.split('.').filter(Boolean);
}

function setNestedFlag(
  container: Record<string, true | Record<string, true>>,
  pathParts: Array<string>,
  leaf: string | null
) {
  let current: Record<string, true | Record<string, true>> = container;

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    const existing = current[part];
    if (existing === true) {
      return; // already fully included
    }
    const existingObj = typeof existing === 'object' ? existing : undefined;
    if (!existingObj) {
      current[part] = {};
    }
    current = current[part] as Record<string, true | Record<string, true>>;
  }

  if (leaf == null) {
    return;
  }

  const leafExisting = current[leaf];
  if (leafExisting === true) return;
  if (typeof leafExisting === 'object') return;
  current[leaf] = true;
}

function addToManifest(
  namespaces: Record<string, true | Record<string, true>>,
  item: TranslationUse
) {
  const {fullNamespace, key, namespace} = item;

  // No namespace: dot-path goes directly into root
  if (namespace == null) {
    if (!key) return;
    const keyParts = splitPath(key);
    if (keyParts.length === 0) return;
    const leaf = keyParts.pop()!;
    setNestedFlag(namespaces, keyParts, leaf);
    return;
  }

  // Namespace with dot notation
  const nsParts = splitPath(namespace);
  if (fullNamespace) {
    // Whole namespace included
    setNestedFlag(namespaces, nsParts, null);
    // mark leaf as true to indicate whole subtree
    setNestedFlag(namespaces, nsParts.slice(0, -1), nsParts.at(-1) ?? null);
    return;
  }

  if (!key) return;

  const keyParts = splitPath(key);
  const leaf = keyParts.pop() ?? key;

  // Ensure namespace object exists, then set leaf (handling dot in key)
  let target: Record<string, true | Record<string, true>> = namespaces;
  for (let i = 0; i < nsParts.length; i++) {
    const part = nsParts[i];
    const existing = target[part];
    if (existing === true) {
      return; // namespace already fully included
    }
    const existingObj = typeof existing === 'object' ? existing : undefined;
    if (!existingObj) {
      target[part] = {};
    }
    target = target[part] as Record<string, true | Record<string, true>>;
  }

  setNestedFlag(target, keyParts, leaf);
}

export async function analyze({
  appDirs,
  projectRoot,
  tsconfigPath
}: {
  appDirs: Array<string>;
  projectRoot: string;
  tsconfigPath?: string;
}): Promise<Manifest> {
  // Reset caches to reflect latest file contents between runs (watch mode).
  fileInfoCache.clear();
  importsCache.clear();

  const manifest = createEmptyManifest();
  const dependencyTree = loadDependencyTree();

  for (const appDir of appDirs) {
    const entries = await findEntryFiles(appDir);

    // Pre-scan layouts to find provider scopes
    for (const entry of entries) {
      const ext = path.extname(entry);
      const base = path.basename(entry, ext);
      if (base !== 'layout') continue;

      const segmentId = getSegmentId(entry, appDir);
      const source = await readFileIfExists(entry);
      const ast = source
        ? await parse(source, {
            syntax: 'typescript',
            tsx: true,
            target: 'esnext',
            comments: false
          })
        : undefined;
      const hasProvider =
        source && ast ? hasNextIntlClientProvider(source, ast) : false;
      if (hasProvider) {
        ensureManifestEntry(manifest, segmentId, true);
      }
    }

    for (const entry of entries) {
      const segmentId = getSegmentId(entry, appDir);

      let treeMap: Map<string, Set<string>> | null = null;
      if (dependencyTree) {
        const tree = dependencyTree({
          filename: entry,
          directory: projectRoot,
          tsConfig: tsconfigPath,
          nodeModulesConfig: {entry: 'module'},
          filter: (filePath: string) => filePath.startsWith(projectRoot),
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']
        }) as Record<string, any>;
        treeMap = flattenDependencyTree(tree);
      }

      const queue: Array<{file: string; inClient: boolean}> = [
        {file: entry, inClient: false}
      ];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const {file, inClient} = queue.shift()!;
        const visitKey = `${file}|${inClient ? 'c' : 's'}`;
        if (visited.has(visitKey)) continue;
        visited.add(visitKey);

        const info = await getFileInfo(file);
        const nowClient = inClient || info.hasUseClient;
        const effectiveClient = nowClient && !info.hasUseServer;

        if (effectiveClient) {
          const ownerEntry = ensureManifestEntry(manifest, segmentId);
          for (const t of info.translations) {
            addToManifest(ownerEntry.namespaces, t);
          }
        }

        const depsFromTree = treeMap?.get(file);
        const depsFromFallback = await getImports(file, projectRoot);
        const deps = new Set<string>([
          ...(depsFromTree ? Array.from(depsFromTree) : []),
          ...depsFromFallback
        ]);

        for (const dep of deps) {
          if (dep.endsWith('.d.ts')) continue;
          queue.push({file: dep, inClient: effectiveClient});
        }
      }
    }
  }

  return manifest;
}

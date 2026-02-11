import type {
  Manifest,
  ManifestNamespaceMap,
  ManifestNamespaces
} from './Manifest.js';

type Messages = Record<string, unknown>;
type ManifestModule = {
  default?: Manifest;
};

const CLIENT_MANIFEST_MODULE_PREFIX = 'next-intl';
const CLIENT_MANIFEST_MODULE_SUFFIX = '_client-manifest.json';

function getClientManifestModuleName(): string {
  return `${CLIENT_MANIFEST_MODULE_PREFIX}/${CLIENT_MANIFEST_MODULE_SUFFIX}`;
}

function isManifestModuleMissing(error: unknown): boolean {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    (error.code === 'MODULE_NOT_FOUND' || error.code === 'ERR_MODULE_NOT_FOUND')
  ) {
    return true;
  }

  return (
    error instanceof Error &&
    error.message.includes(getClientManifestModuleName()) &&
    error.message.toLowerCase().includes('not found')
  );
}

function normalizeSegmentId(segment: string): string {
  const withLeadingSlash = segment.startsWith('/') ? segment : `/${segment}`;
  if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith('/')) {
    return withLeadingSlash.slice(0, -1);
  }
  return withLeadingSlash;
}

function isDescendantSegment(parent: string, segment: string): boolean {
  if (parent === '/') {
    return segment !== '/' && segment.startsWith('/');
  }

  return segment.startsWith(`${parent}/`);
}

function getAncestorSegments(segment: string): Array<string> {
  const parts = normalizeSegmentId(segment).split('/').filter(Boolean);
  const ancestors: Array<string> = [];

  for (let index = 1; index <= parts.length; index++) {
    ancestors.push('/' + parts.slice(0, index).join('/'));
  }

  return ancestors;
}

function mergeNamespaceMaps(
  target: ManifestNamespaceMap,
  source: ManifestNamespaceMap
) {
  for (const [namespace, value] of Object.entries(source)) {
    if (value === true) {
      target[namespace] = true;
      continue;
    }

    const existing = target[namespace];
    if (existing === true) {
      continue;
    }

    if (typeof existing === 'object') {
      mergeNamespaceMaps(existing, value);
      continue;
    }

    const nested: Record<string, true> = {};
    mergeNamespaceMaps(nested as ManifestNamespaceMap, value);
    target[namespace] = nested;
  }
}

function cloneNamespaces(namespaces: ManifestNamespaces): ManifestNamespaces {
  if (namespaces === true) {
    return true;
  }

  const clone: ManifestNamespaceMap = {};
  mergeNamespaceMaps(clone, namespaces);
  return clone;
}

export function mergeManifestNamespaces(
  target: ManifestNamespaces,
  source: ManifestNamespaces
): ManifestNamespaces {
  if (target === true || source === true) {
    return true;
  }

  mergeNamespaceMaps(target, source);
  return target;
}

function isOwnedBySegment(
  ownerSegment: string,
  candidateSegment: string,
  manifest: Manifest
): boolean {
  if (candidateSegment === ownerSegment) {
    return true;
  }

  if (!isDescendantSegment(ownerSegment, candidateSegment)) {
    return false;
  }

  if (manifest[candidateSegment]?.hasLayoutProvider) {
    return false;
  }

  const ancestors = getAncestorSegments(candidateSegment);
  for (const ancestor of ancestors) {
    if (ancestor === ownerSegment) {
      continue;
    }

    if (manifest[ancestor]?.hasLayoutProvider) {
      return false;
    }
  }

  return true;
}

export function collectManifestNamespacesForSegment(
  segment: string,
  manifest: Manifest
): ManifestNamespaces | undefined {
  const normalizedSegment = normalizeSegmentId(segment);
  let merged: ManifestNamespaces | undefined;

  for (const [candidateSegment, entry] of Object.entries(manifest)) {
    if (!entry) continue;
    if (!isOwnedBySegment(normalizedSegment, candidateSegment, manifest)) {
      continue;
    }

    if (!merged) {
      merged = cloneNamespaces(entry.namespaces);
      continue;
    }

    merged = mergeManifestNamespaces(merged, entry.namespaces);
  }

  return merged;
}

function pruneNode(
  selector: ManifestNamespaceMap,
  source: Record<string, unknown>
): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  for (const [key, nestedSelector] of Object.entries(selector)) {
    if (!(key in source)) {
      continue;
    }

    const value = source[key];
    if (nestedSelector === true) {
      output[key] = value;
      continue;
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = pruneNode(
        nestedSelector,
        value as Record<string, unknown>
      );
      if (Object.keys(nested).length > 0) {
        output[key] = nested;
      }
      continue;
    }

    output[key] = value;
  }

  return output;
}

export function pruneMessagesByManifestNamespaces(
  messages: Messages,
  namespaces: ManifestNamespaces
): Messages {
  if (namespaces === true) {
    return messages;
  }

  return pruneNode(namespaces, messages);
}

export function inferMessagesForSegment(
  messages: Messages,
  manifest: Manifest,
  segment: string
): Messages {
  const namespaces = collectManifestNamespacesForSegment(segment, manifest);
  if (!namespaces) {
    return {};
  }

  return pruneMessagesByManifestNamespaces(messages, namespaces);
}

export async function loadTreeShakingManifest(): Promise<Manifest | undefined> {
  try {
    const moduleName = getClientManifestModuleName();
    const module = (await import(moduleName)) as ManifestModule;
    return (module.default ?? module) as Manifest;
  } catch (error) {
    if (isManifestModuleMissing(error)) {
      return undefined;
    }

    throw error;
  }
}

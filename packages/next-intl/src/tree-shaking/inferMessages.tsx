import type {ManifestNamespaceMap, ManifestNamespaces} from './Manifest.js';

type Messages = Record<string, unknown>;

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

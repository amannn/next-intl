'use client';

import {usePathname} from 'next/navigation';
// @ts-expect-error -- Need to export
import manifest from 'next-intl/_client-manifest.json';

type ManifestSegmentEntry = true | Record<string, true | Record<string, true>>;
type ManifestEntry = {
  hasLayoutProvider?: boolean;
  namespaces: ManifestSegmentEntry;
};
type Manifest = Record<string, ManifestEntry | undefined>;
type Messages = Record<string, unknown>;

function normalizeManifestKey(key: string): string {
  const segments = key.split('/').filter(Boolean);
  const normalizedSegments = segments.filter(
    (segment) => !(segment.startsWith('(') && segment.endsWith(')'))
  );
  return normalizedSegments.length === 0
    ? '/'
    : '/' + normalizedSegments.join('/');
}

function findSegmentEntry(
  pathname: string,
  manifest: Manifest
): ManifestEntry | undefined {
  const normalizedPath = pathname === '/' ? '/' : pathname;
  let entry = manifest[normalizedPath];

  if (entry) {
    return entry;
  }

  const segments = normalizedPath.split('/').filter(Boolean);

  for (let i = segments.length; i > 0; i--) {
    const segment = '/' + segments.slice(0, i).join('/');
    entry = manifest[segment];
    if (entry) {
      return entry;
    }
  }

  for (const [key, value] of Object.entries(manifest)) {
    if (!value) continue;

    const normalizedKey = normalizeManifestKey(key);
    if (normalizedKey === normalizedPath) {
      return value;
    }

    const keySegments = normalizedKey.split('/').filter(Boolean);
    const pathSegments = segments;

    const lastKeySegment = keySegments[keySegments.length - 1];
    const isCatchAll =
      lastKeySegment === '[...parts]' || lastKeySegment === '[[...parts]]';

    if (isCatchAll) {
      const prefixSegments = keySegments.slice(0, -1);
      if (pathSegments.length >= prefixSegments.length) {
        let matches = true;
        for (let i = 0; i < prefixSegments.length; i++) {
          if (prefixSegments[i] !== pathSegments[i]) {
            matches = false;
            break;
          }
        }
        if (matches) {
          return value;
        }
      }
      continue;
    }

    if (keySegments.length !== pathSegments.length) continue;

    let matches = true;
    for (let i = 0; i < keySegments.length; i++) {
      const keySegment = keySegments[i];
      const pathSegment = pathSegments[i];

      if (keySegment.startsWith('[') && keySegment.endsWith(']')) {
        continue;
      }

      if (keySegment !== pathSegment) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return value;
    }
  }

  return undefined;
}

function mergeNamespaces(
  target: ManifestSegmentEntry,
  source: ManifestSegmentEntry
): ManifestSegmentEntry {
  if (target === true || source === true) return true;
  const merged = {...target};
  for (const [ns, val] of Object.entries(source)) {
    if (val === true) merged[ns] = true;
    else
      merged[ns] = {
        ...((merged[ns] as Record<string, true>) || {}),
        ...val
      };
  }
  return merged;
}

function collectMessagesForParallelRoute(
  pathname: string,
  manifest: Manifest
): ManifestSegmentEntry | undefined {
  if (!pathname.startsWith('/parallel')) return undefined;

  let merged: ManifestSegmentEntry = {};
  const segments = pathname.split('/').filter(Boolean).slice(1);

  const collect = (key: string) => {
    const entry = manifest[key];
    if (!entry?.namespaces || entry.hasLayoutProvider) return;
    merged = mergeNamespaces(merged, entry.namespaces);
  };

  collect('/parallel');
  if (segments.length > 0) collect(`/parallel/${segments.join('/')}`);
  collect('/parallel/@activity');
  collect('/parallel/@team');
  if (segments.length > 0) {
    collect(`/parallel/@activity/${segments.join('/')}`);
    collect(`/parallel/@team/${segments.join('/')}`);
  }

  return Object.keys(merged).length > 0 ? merged : undefined;
}

function collectMessagesForFeedRoute(
  pathname: string,
  manifest: Manifest
): ManifestSegmentEntry | undefined {
  if (pathname !== '/feed') return undefined;

  let merged: ManifestSegmentEntry = {};

  const collect = (key: string) => {
    const entry = manifest[key];
    if (!entry?.namespaces || entry.hasLayoutProvider) return;
    merged = mergeNamespaces(merged, entry.namespaces);
  };

  collect('/feed');
  collect('/feed/@modal');

  return Object.keys(merged).length > 0 ? merged : undefined;
}

function findInterceptedRoute(
  pathname: string,
  manifest: Manifest
): ManifestEntry | undefined {
  // Look for intercepted routes like /feed/@modal/(..)photo/[id]
  const segments = pathname.split('/').filter(Boolean);

  for (const [key, entry] of Object.entries(manifest)) {
    if (!entry) continue;

    // Check if this is an intercepted route (contains (..), (.), or (...))
    // Match patterns like (..), (.), or (...) followed by the intercepted path
    const interceptMatch = key.match(/\(\.{1,3}\)([^/]+(?:\/[^/]+)*)/);
    if (!interceptMatch) continue;

    // Extract the intercepted path after the intercept marker
    // e.g., /feed/@modal/(..)photo/[id] -> photo/[id]
    const interceptedPath = interceptMatch[1];
    const interceptedSegments = interceptedPath.split('/');

    // Match intercepted path segments with current pathname
    if (interceptedSegments.length !== segments.length) continue;

    let matches = true;
    for (let i = 0; i < interceptedSegments.length; i++) {
      const interceptedSeg = interceptedSegments[i];
      const pathSeg = segments[i];

      // Dynamic segment [id] matches any value
      if (interceptedSeg.startsWith('[') && interceptedSeg.endsWith(']')) {
        continue;
      }

      if (interceptedSeg !== pathSeg) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return entry;
    }
  }

  return undefined;
}

function extractMessages(
  messages: Messages,
  entry: ManifestSegmentEntry
): Record<string, unknown> {
  if (entry === true) {
    return messages;
  }

  const result: Record<string, unknown> = {};

  for (const [ns, val] of Object.entries(entry)) {
    const namespaceValue = messages[ns];
    if (namespaceValue === undefined) {
      continue;
    }

    if (val === true) {
      result[ns] = namespaceValue;
    } else if (typeof val === 'object' && typeof namespaceValue === 'object') {
      const namespaceObj = namespaceValue as Record<string, unknown>;
      const extracted: Record<string, unknown> = {};
      for (const [key] of Object.entries(val)) {
        if (key in namespaceObj) {
          extracted[key] = namespaceObj[key];
        }
      }
      if (Object.keys(extracted).length > 0) {
        result[ns] = extracted;
      }
    }
  }

  return result;
}

type Props = {
  messages: Messages;
};

export default function MessageDebug({messages}: Props) {
  const pathname = usePathname();

  // Try parallel routes first
  let entry: ManifestEntry | undefined;
  const parallelEntry = collectMessagesForParallelRoute(
    pathname,
    manifest as Manifest
  );
  if (parallelEntry) {
    entry = {namespaces: parallelEntry, hasLayoutProvider: false};
  } else {
    // Try feed route with @modal slot
    const feedEntry = collectMessagesForFeedRoute(
      pathname,
      manifest as Manifest
    );
    if (feedEntry) {
      entry = {namespaces: feedEntry, hasLayoutProvider: false};
    } else {
      // Try intercepted routes (e.g., /photo/alpha -> /feed/@modal/(..)photo/[id])
      const interceptedEntry = findInterceptedRoute(
        pathname,
        manifest as Manifest
      );
      if (interceptedEntry) {
        // Also collect parent feed route messages
        const feedBaseEntry = manifest['/feed'];
        let mergedNamespaces = interceptedEntry.namespaces;
        if (feedBaseEntry?.namespaces) {
          mergedNamespaces = mergeNamespaces(
            mergedNamespaces,
            feedBaseEntry.namespaces
          );
        }
        entry = {namespaces: mergedNamespaces, hasLayoutProvider: false};
      } else {
        // Fall back to regular segment lookup
        entry = findSegmentEntry(pathname, manifest as Manifest);
      }
    }
  }

  if (!entry) {
    return (
      <div className="p-2 bg-slate-100 border border-slate-300 text-sm font-mono">
        <strong>Debug:</strong> No manifest entry found for {pathname}
      </div>
    );
  }

  const extractedMessages = extractMessages(messages, entry.namespaces);

  return (
    <div className="p-2 bg-green-100 border border-green-300 text-sm font-mono">
      <div className="mb-2">
        <strong>Path:</strong> {pathname} | <strong>Has provider:</strong>{' '}
        {String(entry.hasLayoutProvider ?? false)}
      </div>
      <pre className="m-0 whitespace-pre-wrap break-words">
        {JSON.stringify(extractedMessages, null, 2)}
      </pre>
    </div>
  );
}

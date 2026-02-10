'use client';

import {usePathname} from 'next/navigation';
// @ts-expect-error -- Need to export
import manifest from 'next-intl/_client-manifest.json';

type ManifestSegmentEntry = true | Record<string, true | Record<string, true>>;
type ManifestEntry = {
  hasProvider: boolean;
  namespaces: ManifestSegmentEntry;
};
type Manifest = Record<string, ManifestEntry | undefined>;
type Messages = Record<string, unknown>;

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

    const keySegments = key.split('/').filter(Boolean);
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
  const entry = findSegmentEntry(pathname, manifest as Manifest);

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
        {String(entry.hasProvider)}
      </div>
      <pre className="m-0 whitespace-pre-wrap break-words">
        {JSON.stringify(extractedMessages, null, 2)}
      </pre>
    </div>
  );
}

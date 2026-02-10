import {Locale, NextIntlClientProvider} from 'next-intl';
import {getLocale, getExtracted, getMessages} from 'next-intl/server';
import {ReactNode} from 'react';
import {cookies} from 'next/headers';
import {Inter} from 'next/font/google';
// @ts-expect-error -- Need to export
import manifest from 'next-intl/_client-manifest.json';

const inter = Inter({subsets: ['latin']});

type Props = {
  children: ReactNode;
};

export async function generateMetadata() {
  const t = await getExtracted();
  return {
    title: t({
      message: 'next-intl example',
      description: 'Default meta title if not overridden by pages'
    })
  };
}

export default async function LocaleLayout({children}: Props) {
  const locale = await getLocale();
  const messages = await getMessages({locale});
  const segment = '/';
  const filteredMessages =
    manifest?.[segment]?.hasLayoutProvider === true
      ? pruneMessages(
          collectNamespacesForSegment(segment, manifest) ?? {},
          messages
        )
      : messages;

  return (
    <html lang={locale}>
      <body
        className={inter.className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}
      >
        <NextIntlClientProvider messages={filteredMessages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

type ManifestSegmentEntry = true | Record<string, true | Record<string, true>>;
type ManifestEntry = {
  hasLayoutProvider: boolean;
  namespaces: ManifestSegmentEntry;
};
type Messages = Awaited<ReturnType<typeof getMessages>>;

function pruneMessages(
  entry: ManifestSegmentEntry,
  messages: Messages
): Messages {
  if (entry === true) {
    return messages;
  }

  function pruneNode(
    selector: Record<string, true | Record<string, true>>,
    source: Record<string, unknown>
  ): Record<string, unknown> {
    const out: Record<string, unknown> = {};

    for (const [key, sel] of Object.entries(selector)) {
      const value = source[key];
      if (sel === true) {
        if (value !== undefined) out[key] = value;
        continue;
      }

      if (value && typeof value === 'object') {
        const nested = pruneNode(sel, value as Record<string, unknown>);
        if (Object.keys(nested).length > 0) {
          out[key] = nested;
        }
        continue;
      }

      if (key in source) {
        out[key] = value;
      }
    }

    return out;
  }

  const pruned = pruneNode(entry, messages as Record<string, unknown>);
  return (Object.keys(pruned).length > 0 ? pruned : messages) as Messages;
}

function mergeNamespaces(
  target: ManifestSegmentEntry,
  source: ManifestSegmentEntry
): ManifestSegmentEntry {
  if (target === true || source === true) {
    return true;
  }

  for (const [ns, val] of Object.entries(source)) {
    if (val === true) {
      target[ns] = true;
      continue;
    }
    const existing = target[ns];
    if (existing === true) {
      continue;
    }
    if (typeof existing === 'object') {
      Object.assign(existing, val);
      continue;
    }
    target[ns] = {...val};
  }

  return target;
}

function collectNamespacesForSegment(
  segment: string,
  manifest: Record<string, ManifestEntry | undefined>
): ManifestSegmentEntry | undefined {
  let merged: ManifestSegmentEntry = {};

  const selfEntry = manifest[segment];
  if (selfEntry?.namespaces) {
    merged = mergeNamespaces(merged, selfEntry.namespaces);
  }

  const prefix = segment === '/' ? '/' : `${segment}/`;
  for (const [key, entry] of Object.entries(manifest)) {
    if (!entry || entry.hasLayoutProvider) continue;
    if (key === segment) continue;
    if (!key.startsWith(prefix)) continue;
    merged = mergeNamespaces(merged, entry.namespaces);
  }

  if (merged === true) {
    return merged;
  }

  return Object.keys(merged).length > 0 ? merged : undefined;
}

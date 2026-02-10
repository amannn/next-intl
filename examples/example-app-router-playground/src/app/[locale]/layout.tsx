import {Metadata} from 'next';
import {Inter} from 'next/font/google';
import {notFound} from 'next/navigation';
import {Locale, NextIntlClientProvider, hasLocale} from 'next-intl';
import {
  getFormatter,
  getNow,
  getTimeZone,
  getTranslations,
  getMessages
} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import Navigation from '../../components/Navigation';
// @ts-expect-error -- Need to export
import manifest from 'next-intl/_client-manifest.json';

const inter = Inter({subsets: ['latin']});

export async function generateMetadata(
  props: Omit<LayoutProps<'/[locale]'>, 'children'>
): Promise<Metadata> {
  const params = await props.params;
  const locale = params.locale as Locale;

  const t = await getTranslations({locale, namespace: 'LocaleLayout'});
  const formatter = await getFormatter({locale});
  const now = await getNow({locale});
  const timeZone = await getTimeZone({locale});

  const base = new URL('http://localhost:3000');
  if (process.env.NEXT_PUBLIC_USE_CASE === 'base-path') {
    base.pathname = '/base/path';
  }

  return {
    metadataBase: base,
    title: t('title'),
    description: t('description'),
    other: {
      currentYear: formatter.dateTime(now, {year: 'numeric'}),
      timeZone
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: LayoutProps<'/[locale]'>) {
  const {locale} = await params;

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({locale});
  const segment = '/[locale]';
  const filteredMessages =
    manifest?.[segment]?.hasProvider === true
      ? pruneMessages(
          collectNamespacesForSegment(segment, manifest) ?? {},
          messages
        )
      : messages;

  return (
    <html className={inter.className} lang={locale}>
      <body>
        <div
          style={{
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
            lineHeight: 1.5
          }}
        >
          <NextIntlClientProvider messages={filteredMessages}>
            <Navigation />
            {children}
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  );
}

type ManifestSegmentEntry = true | Record<string, true | Record<string, true>>;
type ManifestEntry = {
  hasProvider: boolean;
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
    if (!entry || entry.hasProvider) continue;
    if (key === segment) continue;
    if (!key.startsWith(prefix)) continue;
    merged = mergeNamespaces(merged, entry.namespaces);
  }

  if (merged === true) {
    return merged;
  }

  return Object.keys(merged).length > 0 ? merged : undefined;
}

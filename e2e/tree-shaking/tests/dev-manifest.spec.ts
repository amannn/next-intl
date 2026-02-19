import {existsSync, readFileSync, unlinkSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {expect, test as it} from '@playwright/test';

// These tests require `next dev` to verify addDependency/HMR. Skip when using production server.
const isDevServer = process.env.PLAYWRIGHT_DEV === '1';

const manifestPath = join(
  process.cwd(),
  'node_modules/.cache/next-intl/client-manifest.json'
);

function readManifest(): Record<string, unknown> | null {
  if (!existsSync(manifestPath)) return null;
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as unknown;
    if (manifest == null || typeof manifest !== 'object') return null;
    return manifest as Record<string, unknown>;
  } catch {
    return null;
  }
}

function hasSegmentWithNamespace(
  manifest: Record<string, unknown> | null,
  segment: string,
  namespace: string
): boolean {
  if (!manifest) return false;
  const entry = manifest[segment] as Record<string, unknown> | undefined;
  if (!entry?.namespaces) return false;
  const ns = (entry.namespaces as Record<string, unknown>)[namespace];
  return ns === true || (typeof ns === 'object' && ns !== null);
}

it.describe.configure({mode: 'serial'});

it.skip(!isDevServer)(
  'manifest updates when new client component with messages is added',
  async ({page}) => {
    const appDir = join(process.cwd(), 'src', 'app');
    const newComponentPath = join(appDir, 'DevTestComponent.tsx');
    const pagePath = join(appDir, '(home)', 'page.tsx');

    const newComponentContent = `'use client';

import {useTranslations} from 'next-intl';

export default function DevTestComponent() {
  const t = useTranslations('Counter');
  return <span data-testid="dev-test">{t('Increment')}</span>;
}
`;

    let originalPage: string;
    try {
      originalPage = readFileSync(pagePath, 'utf8');
      writeFileSync(newComponentPath, newComponentContent);
      writeFileSync(
        pagePath,
        originalPage.replace(
          "import Counter from './Counter';",
          "import Counter from './Counter';\nimport DevTestComponent from '../DevTestComponent';"
        ).replace(
          '<Counter />',
          '<><Counter /><DevTestComponent /></>'
        )
      );

      await page.goto('/');
      await page.reload();

      await expect
        .poll(
          async () => {
            const m = readManifest();
            return hasSegmentWithNamespace(m, '/(home)', 'Counter');
          },
          {timeout: 15_000}
        )
        .toBe(true);
    } finally {
      try {
        unlinkSync(newComponentPath);
      } catch {
        /* ignore */
      }
      try {
        writeFileSync(pagePath, originalPage);
      } catch {
        /* ignore */
      }
    }
  }
);

it.skip(!isDevServer)(
  'manifest updates when client component with messages is removed',
  async ({page}) => {
    const appDir = join(process.cwd(), 'src', 'app');
    const orphanPath = join(appDir, 'OrphanComponent.tsx');
    const pagePath = join(appDir, '(home)', 'page.tsx');
    const messagesPath = join(process.cwd(), 'messages', 'manual', 'en.json');

    const orphanContent = `'use client';

import {useTranslations} from 'next-intl';

export default function OrphanComponent() {
  const t = useTranslations('DevTestOrphan');
  return <span data-testid="orphan">{t('label')}</span>;
}
`;

    let originalPage: string;
    let originalMessages: string;
    try {
      originalPage = readFileSync(pagePath, 'utf8');
      originalMessages = readFileSync(messagesPath, 'utf8');
      const messages = JSON.parse(originalMessages) as Record<string, unknown>;
      messages['DevTestOrphan'] = {label: 'Orphan label'};
      writeFileSync(messagesPath, JSON.stringify(messages, null, 2));

      writeFileSync(orphanPath, orphanContent);
      writeFileSync(
        pagePath,
        originalPage.replace(
          "import Counter from './Counter';",
          "import Counter from './Counter';\nimport OrphanComponent from '../OrphanComponent';"
        ).replace(
          '<Counter />',
          '<><Counter /><OrphanComponent /></>'
        )
      );

      await page.goto('/');
      await page.reload();
      await expect
        .poll(
          async () =>
            hasSegmentWithNamespace(readManifest(), '/(home)', 'DevTestOrphan'),
          {timeout: 15_000}
        )
        .toBe(true);

      writeFileSync(pagePath, originalPage);
      unlinkSync(orphanPath);

      await page.goto('/');
      await page.reload();
      await expect
        .poll(
          async () =>
            !hasSegmentWithNamespace(readManifest(), '/(home)', 'DevTestOrphan'),
          {timeout: 15_000}
        )
        .toBe(true);
    } finally {
      try {
        unlinkSync(orphanPath);
      } catch {
        /* ignore */
      }
      try {
        writeFileSync(pagePath, originalPage);
      } catch {
        /* ignore */
      }
      try {
        writeFileSync(messagesPath, originalMessages);
      } catch {
        /* ignore */
      }
    }
  }
);

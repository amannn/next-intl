import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {expect, test as it} from '@playwright/test';

// On-demand loader produces segment + __layout keys. We verify structure and key routes.
const REQUIRED_PAGE_NAMESPACES: Record<string, Record<string, unknown>> = {
  '/(home)': {jm1lmy: true, tQLRmz: true},
  '/use-translations': {
    DynamicKey: true,
    GlobalNamespace: {title: true},
    UseTranslationsPage: {title: true}
  },
  '/feed': {I6Uu2z: true}
};

function readManifest(manifestPath: string): Record<string, unknown> | null {
  if (!existsSync(manifestPath)) {
    return null;
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as unknown;
    if (
      manifest == null ||
      Array.isArray(manifest) ||
      typeof manifest !== 'object'
    ) {
      return null;
    }

    return manifest as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readManifestEntryCount(manifestPath: string): number {
  const manifest = readManifest(manifestPath);
  if (manifest == null) {
    return 0;
  }
  return Object.keys(manifest).length;
}

it('writes a non-empty client manifest with expected content', async () => {
  const manifestPath = join(
    process.cwd(),
    'node_modules/.cache/next-intl/client-manifest.json'
  );

  await expect
    .poll(() => readManifestEntryCount(manifestPath), {
      message: 'manifest should be generated and non-empty',
      timeout: 30_000
    })
    .toBeGreaterThan(0);

  const manifest = readManifest(manifestPath);
  expect(manifest).not.toBeNull();

  for (const [segment, expectedNamespaces] of Object.entries(
    REQUIRED_PAGE_NAMESPACES
  )) {
    const entry = manifest![segment];
    expect(entry).toBeDefined();
    expect(entry!.namespaces).toBeDefined();
    for (const [ns, val] of Object.entries(expectedNamespaces)) {
      expect(entry!.namespaces).toHaveProperty(ns, val);
    }
  }
});

import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {expect, test as it} from '@playwright/test';

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

it('writes a non-empty fallback client manifest with required segment entries', async () => {
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

  expect(readManifest(manifestPath)).toMatchObject({
    '/': {
      hasLayoutProvider: true
    },
    '/(home)': {
      hasLayoutProvider: true,
      namespaces: {
        jm1lmy: true,
        tQLRmz: true
      }
    },
    '/feed': {
      hasLayoutProvider: true,
      namespaces: {
        I6Uu2z: true
      }
    },
    '/feed/@modal/(..)photo/[id]': {
      hasLayoutProvider: true,
      namespaces: {
        Ax7uMP: true
      }
    }
  });
});

it('keeps nested provider boundaries in fallback manifest output', () => {
  const manifestPath = join(
    process.cwd(),
    'node_modules/.cache/next-intl/client-manifest.json'
  );

  const manifest = readManifest(manifestPath) as Record<
    string,
    {hasLayoutProvider: boolean; namespaces: Record<string, unknown>}
  > | null;
  expect(manifest).not.toBeNull();
  expect(manifest?.['/feed/@modal/(..)photo/[id]']?.hasLayoutProvider).toBe(
    true
  );
  expect(manifest?.['/feed']?.namespaces?.Ax7uMP).toBeUndefined();
});

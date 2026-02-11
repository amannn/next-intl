import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {expect, test as it} from '@playwright/test';

type Manifest = Record<string, unknown>;

function readManifestEntryCount(manifestPath: string): number {
  if (!existsSync(manifestPath)) {
    return 0;
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as unknown;
    if (
      manifest == null ||
      Array.isArray(manifest) ||
      typeof manifest !== 'object'
    ) {
      return 0;
    }

    return Object.keys(manifest as Manifest).length;
  } catch {
    return 0;
  }
}

it('writes a non-empty client manifest', async () => {
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
});

import fs from 'fs/promises';
import path from 'path';

export type ManifestNamespaceMap = Record<string, true | Record<string, true>>;

export type ManifestNamespaces = true | ManifestNamespaceMap;

export type ManifestEntry = {
  hasLayoutProvider: boolean;
  namespaces: ManifestNamespaces;
};

export type Manifest = Record<string, ManifestEntry | undefined>;

export function createEmptyManifest(): Manifest {
  return {};
}

export async function writeManifest(manifest: Manifest, projectRoot: string) {
  const outDir = path.join(projectRoot, 'node_modules', '.cache', 'next-intl');
  const outFile = path.join(outDir, 'client-manifest.json');
  await fs.mkdir(outDir, {recursive: true});
  await fs.writeFile(outFile, JSON.stringify(manifest, null, 2), 'utf8');
}

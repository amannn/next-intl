import fs from 'fs/promises';
import path from 'path';

const ENTRY_NAMES = new Set([
  'default',
  'error',
  'layout',
  'loading',
  'not-found',
  'page',
  'template',
  'forbidden',
  'unauthorized'
]);

const ENTRY_EXTENSIONS = new Set(['.js', '.jsx', '.mdx', '.ts', '.tsx']);

export type EntryFile = {
  appDir: string;
  filePath: string;
  name: string;
  segmentId: string;
};

export function getSegmentId(filePath: string, appDir: string): string {
  const relativeDir = path.relative(appDir, path.dirname(filePath));
  const parts = relativeDir.split(path.sep).filter(Boolean);
  return parts.length === 0 ? '/' : '/' + parts.join('/');
}

function isEntryFile(fileName: string): boolean {
  const ext = path.extname(fileName);
  if (!ENTRY_EXTENSIONS.has(ext)) return false;
  const base = path.basename(fileName, ext);
  return ENTRY_NAMES.has(base);
}

async function walkEntries(
  appDir: string,
  dir: string,
  results: Array<EntryFile>
) {
  const dirents = await fs.readdir(dir, {withFileTypes: true});
  for (const entry of dirents) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkEntries(appDir, entryPath, results);
      continue;
    }
    if (!isEntryFile(entry.name)) continue;
    const ext = path.extname(entry.name);
    const base = path.basename(entry.name, ext);
    results.push({
      appDir,
      filePath: entryPath,
      name: base,
      segmentId: getSegmentId(entryPath, appDir)
    });
  }
}

export async function scanEntryFiles(
  appDirs: Array<string>
): Promise<Array<EntryFile>> {
  const results: Array<EntryFile> = [];
  for (const appDir of appDirs) {
    await walkEntries(appDir, appDir, results);
  }
  return results;
}

export async function hasNextIntlClientProvider(
  filePath: string
): Promise<boolean> {
  try {
    const source = await fs.readFile(filePath, 'utf8');
    return /<\s*NextIntlClientProvider\b/.test(source);
  } catch {
    return false;
  }
}

import path from 'path';
import type {ExtractorMessageReference} from '@eloqnt/messages/_internal';

export function normalizePathToPosix(filePath: string): string {
  // `path.relative` uses OS-specific separators. For stable `.po` references we
  // always use POSIX separators, regardless of the OS that ran extraction.
  return path.posix.normalize(
    filePath.split(path.win32.sep).join(path.posix.sep)
  );
}

export function localeCompare(a: string, b: string) {
  return a.localeCompare(b, 'en');
}

export function compareReferences(
  refA: ExtractorMessageReference,
  refB: ExtractorMessageReference
): number {
  const pathCompare = localeCompare(refA.path, refB.path);
  if (pathCompare !== 0) return pathCompare;
  return (
    (refA.line ?? 0) - (refB.line ?? 0) ||
    (refA.column ?? 0) - (refB.column ?? 0)
  );
}

export function getDefaultProjectRoot() {
  return process.cwd();
}

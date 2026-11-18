import path from 'path';
import type {ExtractorMessageReference} from '@eloqnt/messages/_internal';
import type {ExtractorConfig} from './types.js';

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

/** Absolute paths of the directories that are scanned for messages. */
export function getSrcPaths(
  config: ExtractorConfig,
  projectRoot: string
): Array<string> {
  return (
    Array.isArray(config.extract.srcPath)
      ? config.extract.srcPath
      : [config.extract.srcPath]
  ).map((srcPath) => path.join(projectRoot, srcPath));
}

/** Lists files that couldn't be parsed, with the parser's error for each. */
export function describeParseFailures(
  failures: Array<{filePath: string; error: unknown}>,
  projectRoot: string
): string {
  return failures
    .map(({error, filePath}) => {
      const relativePath = normalizePathToPosix(
        path.relative(projectRoot, filePath)
      );
      const message = error instanceof Error ? error.message : String(error);
      return `${relativePath}: ${message}`;
    })
    .join('\n\n');
}

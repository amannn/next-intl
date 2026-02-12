import path from 'path';
import SourceFileFilter from '../extractor/source/SourceFileFilter.js';

export type SourcePathMatcher = {
  matches(filePath: string): boolean;
};

function normalizeSrcPaths(
  projectRoot: string,
  srcPaths: Array<string>
): Array<string> {
  return srcPaths.map((srcPath) =>
    path.resolve(
      projectRoot,
      srcPath.endsWith('/') ? srcPath.slice(0, -1) : srcPath
    )
  );
}

export default function createSourcePathMatcher(
  projectRoot: string,
  srcPaths: Array<string>
): SourcePathMatcher {
  const roots = normalizeSrcPaths(projectRoot, srcPaths);
  return {
    matches(filePath: string) {
      return roots.some((root) =>
        SourceFileFilter.isWithinPath(filePath, root)
      );
    }
  };
}

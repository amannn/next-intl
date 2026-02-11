import path from 'path';
import SourceFileFilter from '../../extractor/source/SourceFileFilter.js';
import {getSegmentId} from '../../tree-shaking/EntryScanner.js';
import type {TurbopackLoaderContext} from '../types.js';

const NEXT_INTL_CLIENT_PROVIDER_TAG = '<NextIntlClientProvider';
const INFER_MESSAGES_LITERAL_PATTERN = /\bmessages\s*=\s*(['"])infer\1/;
const INFER_MESSAGES_EXPRESSION_PATTERN =
  /\bmessages\s*=\s*\{\s*(['"])infer\1\s*\}/;
const LAYOUT_SEGMENT_PROP_PATTERN = /\b__layoutSegment\s*=/;

export type LayoutSegmentLoaderConfig = {
  srcPath: string | Array<string>;
};

function normalizeSrcPath(srcPath: string): string {
  const normalized = srcPath.replace(/[/\\]+$/, '');
  return normalized || srcPath;
}

function getConfiguredSrcPaths(srcPath: string | Array<string>): Array<string> {
  const srcPaths = Array.isArray(srcPath) ? srcPath : [srcPath];
  return srcPaths.map(normalizeSrcPath);
}

function getAbsoluteAppDirs(
  rootContext: string,
  srcPath: string | Array<string>
): Array<string> {
  const srcPaths = getConfiguredSrcPaths(srcPath);

  return srcPaths.map((currentPath) => {
    const absolutePath = path.resolve(rootContext, currentPath);
    return path.basename(absolutePath) === 'app'
      ? absolutePath
      : path.join(absolutePath, 'app');
  });
}

export function resolveAppDirForResource(
  rootContext: string,
  resourcePath: string,
  srcPath: string | Array<string>
): string | undefined {
  const appDirs = getAbsoluteAppDirs(rootContext, srcPath);

  for (const appDir of appDirs) {
    if (SourceFileFilter.isWithinPath(resourcePath, appDir)) {
      return appDir;
    }
  }

  return undefined;
}

function hasInferMessagesProp(openingTag: string): boolean {
  return (
    INFER_MESSAGES_LITERAL_PATTERN.test(openingTag) ||
    INFER_MESSAGES_EXPRESSION_PATTERN.test(openingTag)
  );
}

function hasLayoutSegmentProp(openingTag: string): boolean {
  return LAYOUT_SEGMENT_PROP_PATTERN.test(openingTag);
}

function addLayoutSegmentProp(openingTag: string, segmentId: string): string {
  const match = openingTag.match(/\s*\/?>$/);
  if (!match || match.index == null) {
    return openingTag;
  }

  const prop = ` __layoutSegment=${JSON.stringify(segmentId)}`;
  return (
    openingTag.slice(0, match.index) + prop + openingTag.slice(match.index)
  );
}

function findOpeningTagEnd(source: string, fromIndex: number): number {
  let braceDepth = 0;
  let quote: '"' | "'" | '`' | undefined;
  let escaped = false;

  for (let index = fromIndex; index < source.length; index++) {
    const char = source[index];

    if (quote) {
      if (char === quote && !escaped) {
        quote = undefined;
      }
      escaped = char === '\\' && !escaped;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      escaped = false;
      continue;
    }

    if (char === '{') {
      braceDepth++;
      continue;
    }

    if (char === '}') {
      if (braceDepth > 0) {
        braceDepth--;
      }
      continue;
    }

    if (char === '>' && braceDepth === 0) {
      return index;
    }
  }

  return -1;
}

export function injectLayoutSegment(
  source: string,
  segmentId: string
): string {
  if (!source.includes(NEXT_INTL_CLIENT_PROVIDER_TAG)) {
    return source;
  }

  let output = '';
  let cursor = 0;

  while (cursor < source.length) {
    const start = source.indexOf(NEXT_INTL_CLIENT_PROVIDER_TAG, cursor);
    if (start === -1) {
      output += source.slice(cursor);
      break;
    }

    output += source.slice(cursor, start);
    const tagEnd = findOpeningTagEnd(
      source,
      start + NEXT_INTL_CLIENT_PROVIDER_TAG.length
    );
    if (tagEnd === -1) {
      output += source.slice(start);
      break;
    }

    const openingTag = source.slice(start, tagEnd + 1);
    const shouldInject =
      hasInferMessagesProp(openingTag) && !hasLayoutSegmentProp(openingTag);

    output += shouldInject
      ? addLayoutSegmentProp(openingTag, segmentId)
      : openingTag;
    cursor = tagEnd + 1;
  }

  return output;
}

export default function layoutSegmentLoader(
  this: TurbopackLoaderContext<LayoutSegmentLoaderConfig>,
  source: string
) {
  const options = this.getOptions();
  if (!options?.srcPath) {
    return source;
  }

  const appDir = resolveAppDirForResource(
    this.rootContext,
    this.resourcePath,
    options.srcPath
  );
  if (!appDir) {
    return source;
  }

  const segmentId = getSegmentId(this.resourcePath, appDir);
  return injectLayoutSegment(source, segmentId);
}

import path from 'path';
import {describe, expect, it} from 'vitest';
import {getSegmentId} from './EntryScanner.js';

describe('getSegmentId', () => {
  it('keeps route group and parallel segments in the manifest path', () => {
    const appDir = path.join('/project', 'src', 'app');
    const filePath = path.join(
      appDir,
      'feed',
      '@modal',
      '(..)photo',
      '[id]',
      'page.tsx'
    );

    expect(getSegmentId(filePath, appDir)).toBe('/feed/@modal/(..)photo/[id]');
  });

  it('keeps route groups instead of stripping them', () => {
    const appDir = path.join('/project', 'src', 'app');
    const filePath = path.join(
      appDir,
      '(group)',
      'group-one',
      'page.tsx'
    );

    expect(getSegmentId(filePath, appDir)).toBe('/(group)/group-one');
  });

  it('returns root for entries at app root', () => {
    const appDir = path.join('/project', 'src', 'app');
    const filePath = path.join(appDir, 'page.tsx');

    expect(getSegmentId(filePath, appDir)).toBe('/');
  });
});

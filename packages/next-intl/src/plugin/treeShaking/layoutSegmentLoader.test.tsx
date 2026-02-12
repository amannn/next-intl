import path from 'path';
import {describe, expect, it} from 'vitest';
import type {TurbopackLoaderContext} from '../types.js';
import layoutSegmentLoader, {
  type LayoutSegmentLoaderConfig
} from './layoutSegmentLoader.js';

function runLoader({
  resourcePath,
  rootContext = '/project',
  source
}: {
  resourcePath: string;
  rootContext?: string;
  source: string;
}): string {
  const context: TurbopackLoaderContext<LayoutSegmentLoaderConfig> = {
    getOptions() {
      return {};
    },
    resourcePath,
    rootContext
  } as unknown as TurbopackLoaderContext<LayoutSegmentLoaderConfig>;

  return layoutSegmentLoader.call(context, source);
}

describe('layoutSegmentLoader', () => {
  it('injects layout metadata and manifest import for messages="infer"', () => {
    const resourcePath = path.join(
      '/project',
      'src',
      'app',
      'feed',
      '@modal',
      '(..)photo',
      '[id]',
      'layout.tsx'
    );

    const source = [
      "import {NextIntlClientProvider} from 'next-intl';",
      '',
      'export default function Layout({children}: LayoutProps) {',
      '  return <NextIntlClientProvider messages="infer">{children}</NextIntlClientProvider>;',
      '}'
    ].join('\n');

    const result = runLoader({resourcePath, source});

    expect(result).toContain('messages="infer"');
    expect(result).toContain('__layoutSegment="/feed/@modal/(..)photo/[id]"');
    expect(result).toContain(
      '__inferredMessagesManifest={__nextIntlLayoutClientManifest}'
    );
    expect(result).toContain('import __nextIntlLayoutClientManifest');
    expect(result).toContain('next-intl/_client-manifest?');
    expect(result).toContain(
      'segment=%2Ffeed%2F%40modal%2F%28..%29photo%2F%5Bid%5D'
    );
    expect(
      result.indexOf('import __nextIntlLayoutClientManifest')
    ).toBeLessThan(result.indexOf('export default function Layout'));
  });

  it('injects metadata for messages={"infer"}', () => {
    const resourcePath = path.join(
      '/project',
      'src',
      'app',
      'actions',
      'layout.ts'
    );
    const source =
      '<NextIntlClientProvider messages={"infer"}>content</NextIntlClientProvider>';

    const result = runLoader({resourcePath, source});

    expect(result).toContain('__layoutSegment="/actions"');
    expect(result).toContain(
      '__inferredMessagesManifest={__nextIntlLayoutClientManifest}'
    );
  });

  it('returns root segment for app root layout', () => {
    const resourcePath = path.join('/project', 'app', 'layout.tsx');
    const source =
      '<NextIntlClientProvider messages="infer">content</NextIntlClientProvider>';

    const result = runLoader({resourcePath, source});

    expect(result).toContain('__layoutSegment="/"');
    expect(result).toContain('segment=%2F');
  });

  it('does not inject when messages is not infer', () => {
    const resourcePath = path.join('/project', 'src', 'app', 'layout.tsx');
    const source =
      '<NextIntlClientProvider messages={{Test: "value"}}>content</NextIntlClientProvider>';

    const result = runLoader({resourcePath, source});

    expect(result).not.toContain('__layoutSegment=');
    expect(result).not.toContain('__inferredMessagesManifest=');
    expect(result).not.toContain('next-intl/_client-manifest?');
  });

  it('does not duplicate __layoutSegment when already present', () => {
    const resourcePath = path.join('/project', 'src', 'app', 'layout.tsx');
    const source =
      '<NextIntlClientProvider __layoutSegment="/" messages="infer">content</NextIntlClientProvider>';

    const result = runLoader({resourcePath, source});
    const layoutSegmentMatches = result.match(/__layoutSegment=/g) ?? [];
    const manifestMatches = result.match(/__inferredMessagesManifest=/g) ?? [];

    expect(layoutSegmentMatches).toHaveLength(1);
    expect(manifestMatches).toHaveLength(1);
  });

  it('does not duplicate manifest import when already present', () => {
    const resourcePath = path.join('/project', 'src', 'app', 'layout.tsx');
    const source = [
      "import __nextIntlLayoutClientManifest from 'next-intl/_client-manifest?layout=src%2Fapp%2Flayout.tsx&segment=%2F';",
      '<NextIntlClientProvider __inferredMessagesManifest={__nextIntlLayoutClientManifest} messages="infer">content</NextIntlClientProvider>'
    ].join('\n');

    const result = runLoader({resourcePath, source});
    const importMatches =
      result.match(/import __nextIntlLayoutClientManifest/g) ?? [];
    const manifestMatches = result.match(/__inferredMessagesManifest=/g) ?? [];

    expect(importMatches).toHaveLength(1);
    expect(manifestMatches).toHaveLength(1);
  });

  it('does not inject outside Next.js app roots', () => {
    const resourcePath = path.join('/project', 'custom', 'app', 'layout.tsx');
    const source =
      '<NextIntlClientProvider messages="infer">content</NextIntlClientProvider>';

    const result = runLoader({resourcePath, source});

    expect(result).not.toContain('__layoutSegment=');
    expect(result).not.toContain('__inferredMessagesManifest=');
  });
});

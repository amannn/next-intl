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
  it('injects __layoutSegment for messages="infer"', () => {
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
  });

  it('injects __layoutSegment for messages={"infer"}', () => {
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
  });

  it('returns root segment for app root layout', () => {
    const resourcePath = path.join('/project', 'app', 'layout.tsx');
    const source =
      '<NextIntlClientProvider messages="infer">content</NextIntlClientProvider>';

    const result = runLoader({resourcePath, source});

    expect(result).toContain('__layoutSegment="/"');
  });

  it('does not inject when messages is not infer', () => {
    const resourcePath = path.join('/project', 'src', 'app', 'layout.tsx');
    const source =
      '<NextIntlClientProvider messages={{Test: "value"}}>content</NextIntlClientProvider>';

    const result = runLoader({resourcePath, source});

    expect(result).not.toContain('__layoutSegment=');
  });

  it('does not inject when __layoutSegment already exists', () => {
    const resourcePath = path.join('/project', 'src', 'app', 'layout.tsx');
    const source =
      '<NextIntlClientProvider __layoutSegment="/" messages="infer">content</NextIntlClientProvider>';

    const result = runLoader({resourcePath, source});
    const matches = result.match(/__layoutSegment=/g) ?? [];

    expect(matches).toHaveLength(1);
  });

  it('does not inject outside Next.js app roots', () => {
    const resourcePath = path.join('/project', 'custom', 'app', 'layout.tsx');
    const source =
      '<NextIntlClientProvider messages="infer">content</NextIntlClientProvider>';

    const result = runLoader({resourcePath, source});

    expect(result).not.toContain('__layoutSegment=');
  });
});

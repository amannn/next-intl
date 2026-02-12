import fs from 'fs/promises';
import {createHash} from 'node:crypto';
import path from 'path';
import {afterEach, describe, expect, it} from 'vitest';
import type {TurbopackLoaderContext} from '../types.js';
import segmentManifestLoader, {
  type SegmentManifestLoaderConfig
} from './segmentManifestLoader.js';

const TEMP_DIR_PREFIX = path.join(
  process.cwd(),
  '.tmp-segment-manifest-loader-'
);

function getExtractedKey(message: string): string {
  return createHash('sha512').update(message).digest('base64').slice(0, 6);
}

async function writeFixtureFile(
  projectRoot: string,
  relativePath: string,
  content: string
) {
  const filePath = path.join(projectRoot, relativePath);
  await fs.mkdir(path.dirname(filePath), {recursive: true});
  await fs.writeFile(filePath, content, 'utf8');
}

async function createFixtureProject() {
  const projectRoot = await fs.mkdtemp(TEMP_DIR_PREFIX);

  await writeFixtureFile(
    projectRoot,
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          baseUrl: '.'
        }
      },
      null,
      2
    )
  );

  await writeFixtureFile(
    projectRoot,
    'src/app/feed/layout.tsx',
    [
      "import {NextIntlClientProvider} from 'next-intl';",
      '',
      'export default function FeedLayout({children}: LayoutProps) {',
      '  return <NextIntlClientProvider messages="infer">{children}</NextIntlClientProvider>;',
      '}'
    ].join('\n')
  );

  await writeFixtureFile(
    projectRoot,
    'src/app/feed/page.tsx',
    [
      "'use client';",
      '',
      "import {useExtracted} from 'next-intl';",
      "import SharedFeedComponent from './SharedFeedComponent';",
      '',
      'export default function FeedPage() {',
      '  const t = useExtracted();',
      "  return <div><p>{t('Feed page')}</p><SharedFeedComponent /></div>;",
      '}'
    ].join('\n')
  );

  await writeFixtureFile(
    projectRoot,
    'src/app/feed/SharedFeedComponent.tsx',
    [
      "'use client';",
      '',
      "import {useExtracted} from 'next-intl';",
      '',
      'export default function SharedFeedComponent() {',
      '  const t = useExtracted();',
      "  return <p>{t('Shared feed component')}</p>;",
      '}'
    ].join('\n')
  );

  await writeFixtureFile(
    projectRoot,
    'src/app/feed/@modal/default.tsx',
    [
      "'use client';",
      '',
      "import {useExtracted} from 'next-intl';",
      '',
      'export default function FeedModalDefault() {',
      '  const t = useExtracted();',
      "  return <p>{t('Feed modal default')}</p>;",
      '}'
    ].join('\n')
  );

  await writeFixtureFile(
    projectRoot,
    'src/app/feed/@modal/(..)photo/[id]/layout.tsx',
    [
      "import {NextIntlClientProvider} from 'next-intl';",
      '',
      'export default function InterceptedLayout({children}: LayoutProps) {',
      '  return <NextIntlClientProvider messages="infer">{children}</NextIntlClientProvider>;',
      '}'
    ].join('\n')
  );

  await writeFixtureFile(
    projectRoot,
    'src/app/feed/@modal/(..)photo/[id]/page.tsx',
    [
      "'use client';",
      '',
      "import {useExtracted} from 'next-intl';",
      '',
      'export default function InterceptedPhotoPage() {',
      '  const t = useExtracted();',
      "  return <p>{t('Intercepted photo modal: {id}')}</p>;",
      '}'
    ].join('\n')
  );

  return projectRoot;
}

function parseDefaultExport(code: string): unknown {
  const match = code.match(/^export default ([\s\S]*);$/);
  if (!match) {
    throw new Error(`Unable to parse loader output: ${code}`);
  }

  const raw = match[1].trim();
  if (raw === 'undefined') {
    return undefined;
  }

  return JSON.parse(raw) as unknown;
}

async function runLoader({
  projectRoot,
  resourceQuery,
  source = '{}'
}: {
  projectRoot: string;
  resourceQuery?: string;
  source?: string;
}) {
  const dependencies = new Set<string>();
  const contextDependencies = new Set<string>();
  const warnings: Array<unknown> = [];
  const resourcePath = path.join(
    projectRoot,
    'node_modules',
    '.cache',
    'next-intl',
    'client-manifest.json'
  );

  const result = await new Promise<string>((resolve, reject) => {
    const context: TurbopackLoaderContext<SegmentManifestLoaderConfig> = {
      addContextDependency(contextDependency: string) {
        contextDependencies.add(contextDependency);
      },
      addDependency(dependencyPath: string) {
        dependencies.add(dependencyPath);
      },
      async() {
        return (error: Error | null, value: unknown) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(value as string);
        };
      },
      emitWarning(warning: Error) {
        warnings.push(warning);
      },
      getOptions() {
        return {srcPath: 'src'};
      },
      resourcePath,
      resourceQuery,
      rootContext: projectRoot
    } as unknown as TurbopackLoaderContext<SegmentManifestLoaderConfig>;

    const maybeResult = segmentManifestLoader.call(context, source);
    if (typeof maybeResult === 'string') {
      resolve(maybeResult);
    }
  });

  return {
    contextDependencies: Array.from(contextDependencies),
    dependencies: Array.from(dependencies),
    output: parseDefaultExport(result),
    warnings
  };
}

const tempProjects: Array<string> = [];

afterEach(async () => {
  await Promise.all(
    tempProjects.map((projectRoot) =>
      fs.rm(projectRoot, {force: true, recursive: true})
    )
  );
  tempProjects.length = 0;
});

describe('segmentManifestLoader', () => {
  it('infers namespaces for a segment and respects nested provider ownership', async () => {
    const projectRoot = await createFixtureProject();
    tempProjects.push(projectRoot);

    const result = await runLoader({
      projectRoot,
      resourceQuery: '?layout=src%2Fapp%2Ffeed%2Flayout.tsx&segment=%2Ffeed'
    });

    expect(result.output).toEqual({
      [getExtractedKey('Feed page')]: true,
      [getExtractedKey('Feed modal default')]: true,
      [getExtractedKey('Shared feed component')]: true
    });
    expect(
      (result.output as Record<string, unknown>)[
        getExtractedKey('Intercepted photo modal: {id}')
      ]
    ).toBeUndefined();
  });

  it('registers dependency and context invalidation for the owner subtree', async () => {
    const projectRoot = await createFixtureProject();
    tempProjects.push(projectRoot);

    const result = await runLoader({
      projectRoot,
      resourceQuery: '?layout=src%2Fapp%2Ffeed%2Flayout.tsx&segment=%2Ffeed'
    });

    expect(result.warnings).toEqual([]);
    expect(result.dependencies).toContain(
      path.join(projectRoot, 'src/app/feed/page.tsx')
    );
    expect(result.dependencies).toContain(
      path.join(projectRoot, 'src/app/feed/SharedFeedComponent.tsx')
    );
    expect(result.dependencies).toContain(
      path.join(projectRoot, 'src/app/feed/@modal/default.tsx')
    );
    expect(result.dependencies).toContain(
      path.join(projectRoot, 'src/app/feed/@modal/(..)photo/[id]/layout.tsx')
    );
    expect(result.contextDependencies).toContain(
      path.join(projectRoot, 'src/app/feed')
    );
  });

  it('returns full manifest content when no segment query is present', async () => {
    const result = await runLoader({
      projectRoot: '/project',
      source: JSON.stringify({
        '/': {
          hasLayoutProvider: true,
          namespaces: {}
        }
      })
    });

    expect(result.output).toEqual({
      '/': {
        hasLayoutProvider: true,
        namespaces: {}
      }
    });
  });
});

import fs from 'fs/promises';
import {createHash} from 'node:crypto';
import path from 'path';
import {afterEach, describe, expect, it} from 'vitest';
import TreeShakingAnalyzer from './Analyzer.js';

const TEMP_DIR_PREFIX = path.join(process.cwd(), '.tmp-tree-shaking-analyzer-');

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
    'src/app/actions/page.tsx',
    [
      "'use client';",
      '',
      "import {useExtracted} from 'next-intl';",
      '',
      'export default function ActionsPage() {',
      '  const t = useExtracted();',
      "  return <p>{t('Actions page')}</p>;",
      '}'
    ].join('\n')
  );

  await writeFixtureFile(
    projectRoot,
    'src/app/(group)/group-one/page.tsx',
    [
      "'use client';",
      '',
      "import {useExtracted} from 'next-intl';",
      '',
      'export default function GroupOnePage() {',
      '  const t = useExtracted();',
      "  return <p>{t('Group (one) page')}</p>;",
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

  await writeFixtureFile(
    projectRoot,
    'src/app/type-imports/page.tsx',
    [
      "import {useExtracted} from 'next-intl';",
      "import TypeImportComponent from './TypeImportComponent';",
      '',
      "export type Test = 'test';",
      '',
      'export default function TypeImportsPage() {',
      '  const t = useExtracted();',
      '  return (',
      '    <div>',
      "      <p>{t('Type imports page')}</p>",
      '      <TypeImportComponent />',
      '    </div>',
      '  );',
      '}'
    ].join('\n')
  );

  await writeFixtureFile(
    projectRoot,
    'src/app/type-imports/TypeImportComponent.tsx',
    [
      "'use client';",
      '',
      "import {useExtracted} from 'next-intl';",
      "import type {Test} from './page';",
      '',
      'export default function TypeImportComponent() {',
      '  const t = useExtracted();',
      '',
      "  const test: Test = 'test';",
      '',
      "  return <p>{t('Test label: {value}', {value: test})}</p>;",
      '}'
    ].join('\n')
  );

  await writeFixtureFile(
    projectRoot,
    'src/app/barrel/page.tsx',
    [
      "import {UsedBarrelComponent} from './components';",
      '',
      'export default function BarrelPage() {',
      '  return <UsedBarrelComponent />;',
      '}'
    ].join('\n')
  );

  await writeFixtureFile(
    projectRoot,
    'src/app/barrel/components/index.ts',
    [
      "export {default as UnusedBarrelComponent} from './UnusedBarrelComponent';",
      "export {default as UsedBarrelComponent} from './UsedBarrelComponent';"
    ].join('\n')
  );

  await writeFixtureFile(
    projectRoot,
    'src/app/barrel/components/UsedBarrelComponent.tsx',
    [
      "'use client';",
      '',
      "import {useExtracted} from 'next-intl';",
      '',
      'export default function UsedBarrelComponent() {',
      '  const t = useExtracted();',
      "  return <p>{t('Used barrel component')}</p>;",
      '}'
    ].join('\n')
  );

  await writeFixtureFile(
    projectRoot,
    'src/app/barrel/components/UnusedBarrelComponent.tsx',
    [
      "'use client';",
      '',
      "import {useExtracted} from 'next-intl';",
      '',
      'export default function UnusedBarrelComponent() {',
      '  const t = useExtracted();',
      "  return <p>{t('Unused barrel component')}</p>;",
      '}'
    ].join('\n')
  );

  return projectRoot;
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

describe('TreeShakingAnalyzer', () => {
  it('keeps full segment paths, sorts by segment hierarchy and ignores type-only back-edges', async () => {
    const projectRoot = await createFixtureProject();
    tempProjects.push(projectRoot);

    const analyzer = new TreeShakingAnalyzer({
      projectRoot,
      srcPaths: ['src'],
      tsconfigPath: path.join(projectRoot, 'tsconfig.json')
    });

    const manifest = await analyzer.analyze({
      appDirs: [path.join(projectRoot, 'src', 'app')]
    });

    expect(Object.keys(manifest)).toEqual([
      '/(group)/group-one',
      '/actions',
      '/barrel',
      '/feed/@modal/(..)photo/[id]',
      '/type-imports'
    ]);

    expect(manifest['/group-one']).toBeUndefined();
    expect(manifest['/feed/[id]']).toBeUndefined();

    expect(
      Object.keys(
        (manifest['/type-imports']?.namespaces ?? {}) as Record<string, true>
      )
    ).toEqual([getExtractedKey('Test label: {value}')]);
    expect(
      (manifest['/type-imports']?.namespaces as Record<string, true>)[
        getExtractedKey('Type imports page')
      ]
    ).toBeUndefined();
    expect(
      (manifest['/barrel']?.namespaces as Record<string, true>)[
        getExtractedKey('Used barrel component')
      ]
    ).toBe(true);
    expect(
      (manifest['/barrel']?.namespaces as Record<string, true>)[
        getExtractedKey('Unused barrel component')
      ]
    ).toBeUndefined();
  });
});

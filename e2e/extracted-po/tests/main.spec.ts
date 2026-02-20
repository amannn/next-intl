import path from 'path';
import {fileURLToPath} from 'url';
import {expect, test as it} from '@playwright/test';
import {createExtractionHelpers} from '../../extracted-json/tests/helpers.js';

const {describe} = it;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, '..');
const MESSAGES_DIR = path.join(APP_ROOT, 'messages');

const {expectPo} = createExtractionHelpers(MESSAGES_DIR);

async function withTempEdit(
  filePath: string,
  newContent: string
): Promise<{[Symbol.asyncDispose]: () => Promise<void>}> {
  const fs = await import('fs/promises');
  const fullPath = path.join(APP_ROOT, filePath);
  const original = await fs.readFile(fullPath, 'utf-8');
  await fs.writeFile(fullPath, newContent);
  return {
    [Symbol.asyncDispose]: async () => fs.writeFile(fullPath, original)
  };
}

describe('extraction po format', () => {
  it('saves messages initially', async ({page}) => {
    await page.goto('/');
    const content = await expectPo('en.po', (c) => {
      return c.includes('msgid "+YJVTi"') && c.includes('msgstr "Hey!"');
    });
    expect(content).toContain('msgid "+YJVTi"');
    expect(content).toContain('msgstr "Hey!"');
  });

  it('tracks all line numbers when same message appears multiple times in one file', async ({
    page
  }) => {
    await using _ = await withTempEdit(
      'src/components/Greeting.tsx',
      `'use client';

import {useExtracted} from 'next-intl';

export default function Greeting() {
  const t = useExtracted();
  return (
    <div>
      {t('Hello!')}
      {t('Hey!')}
      <span>{t('Hello!')}</span>
    </div>
  );
}
`
    );

    await page.goto('/');
    const content = await expectPo('en.po', (c) => {
      return (
        c.includes('msgid "OpKKos"') &&
        c.includes('msgstr "Hello!"') &&
        c.includes('Greeting.tsx')
      );
    });
    const greetingRefs = content.match(/#: [^\n]*Greeting\.tsx[^\n]*/g) ?? [];
    expect(content).toContain('msgid "OpKKos"');
    expect(content).toContain('msgstr "Hello!"');
    expect(greetingRefs.length).toBeGreaterThanOrEqual(2);
  });

  it('saves changes to descriptions', async ({page}) => {
    await page.goto('/');
    await expectPo('en.po', (c) => c.includes('msgid "+YJVTi"'));

    await using _ = await withTempEdit(
      'src/components/Greeting.tsx',
      `'use client';

import {useExtracted} from 'next-intl';

export default function Greeting() {
  const t = useExtracted();
  return (
    <div>
      {t({
        message: 'Hey!',
        description: 'Shown on home screen'
      })}
    </div>
  );
}
`
    );

    await page.goto('/');
    const content = await expectPo('en.po', (c) => {
      return (
        c.includes('#. Shown on home screen') && c.includes('msgid "+YJVTi"')
      );
    });
    expect(content).toContain('#. Shown on home screen');
    expect(content).toContain('msgid "+YJVTi"');
  });

  it('combines references from multiple files', async ({page}) => {
    await page.goto('/');
    const content = await expectPo('en.po', (c) => {
      return (
        c.includes('msgid "+YJVTi"') &&
        c.includes('Footer.tsx') &&
        c.includes('Greeting.tsx')
      );
    });
    expect(content).toContain('src/components/Footer.tsx');
    expect(content).toContain('src/components/Greeting.tsx');
    expect(content).toContain('msgid "+YJVTi"');
  });

  it('supports namespaces', async ({page}) => {
    await page.goto('/');
    await expectPo('en.po', (c) => c.includes('msgid "+YJVTi"'));

    await using _ = await withTempEdit(
      'src/components/Greeting.tsx',
      `'use client';

import {useExtracted} from 'next-intl';

export default function Greeting() {
  const t = useExtracted('ui');
  return <div>{t('Hello!')}</div>;
}
`
    );

    await page.goto('/');
    const content = await expectPo('en.po', (c) => {
      return c.includes('msgctxt "ui"') && c.includes('msgid "OpKKos"');
    });
    expect(content).toContain('msgctxt "ui"');
    expect(content).toContain('msgid "OpKKos"');
    expect(content).toContain('msgstr "Hello!"');
  });

  it('removes references when a message is dropped from a single file', async ({
    page
  }) => {
    await using _ = await withTempEdit(
      'src/components/Greeting.tsx',
      `'use client';

import {useExtracted} from 'next-intl';

export default function Greeting() {
  const t = useExtracted();
  return (
    <div>
      {t('Hey!')}
      {t('Howdy!')}
    </div>
  );
}
`
    );

    await page.goto('/');
    await expectPo('en.po', (c) => {
      return c.includes('msgid "+YJVTi"') && c.includes('msgid "4xqPlJ"');
    });

    await using __ = await withTempEdit(
      'src/components/Greeting.tsx',
      `'use client';

import {useExtracted} from 'next-intl';

export default function Greeting() {
  const t = useExtracted();
  return <div>{t('Howdy!')}</div>;
}
`
    );

    await page.goto('/');
    const content = await expectPo('en.po', (c) => {
      return (
        c.includes('msgid "+YJVTi"') &&
        c.includes('msgid "4xqPlJ"') &&
        c.includes('Footer.tsx')
      );
    });
    expect(content).toContain('msgid "+YJVTi"');
    expect(content).toContain('Footer.tsx');
    expect(content).toContain('msgid "4xqPlJ"');
  });
});

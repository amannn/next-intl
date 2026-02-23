import path from 'path';
import {fileURLToPath} from 'url';
import {expect, test as it} from '@playwright/test';
import {
  createExtractionHelpers,
  getPoEntry,
  withTempEdit,
  withTempRemove
} from '../../extracted-json/tests/helpers.js';

const {describe} = it;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, '..');
const MESSAGES_DIR = path.join(APP_ROOT, 'messages');

const {expectPo} = createExtractionHelpers(MESSAGES_DIR);
const withTempEditApp = (p: string, c: string) => withTempEdit(APP_ROOT, p, c);
const withTempRemoveApp = (p: string) => withTempRemove(APP_ROOT, p);

describe('extraction po format', () => {
  it('saves messages initially', async ({page}) => {
    await page.goto('/');
    const content = await expectPo('en.po', (poContent) => {
      const entry = getPoEntry(poContent, '+YJVTi');
      return entry != null && entry.includes('msgstr "Hey!"');
    });
    const entry = getPoEntry(content, '+YJVTi');
    expect(entry).toMatch(/msgid "\+YJVTi"\s+msgstr "Hey!"/);
  });

  it('tracks all line numbers when same message appears multiple times in one file', async ({
    page
  }) => {
    await using _ = await withTempEditApp(
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
    const content = await expectPo('en.po', (poContent) => {
      const entry = getPoEntry(poContent, 'OpKKos');
      return entry != null;
    });
    const entry = getPoEntry(content, 'OpKKos');
    expect(entry).toMatch(/msgstr "Hello!"/);
    expect(entry).toMatch(/Greeting\.tsx/);
    const greetingRefs = entry!.match(/#: [^\n]*Greeting\.tsx[^\n]*/g) ?? [];
    expect(greetingRefs.length).toBeGreaterThanOrEqual(2);
  });

  it('saves catalog when it\'s missing', async ({page}) => {
    await page.goto('/');
    await expectPo('en.po', (poContent) => getPoEntry(poContent, '+YJVTi') != null);

    await using _ = await withTempRemoveApp('messages/en.po');

    await using __ = await withTempEditApp(
      'src/components/Greeting.tsx',
      `'use client';

import {useExtracted} from 'next-intl';

export default function Greeting() {
  const t = useExtracted();
  return <div>{t('Hey!')}{t('Hello!')}</div>;
}
`
    );

    await page.goto('/');
    const content = await expectPo('en.po', (poContent) => {
      return (
        getPoEntry(poContent, '+YJVTi') != null &&
        getPoEntry(poContent, 'OpKKos') != null
      );
    });
    const heyEntry = getPoEntry(content, '+YJVTi');
    const helloEntry = getPoEntry(content, 'OpKKos');
    expect(heyEntry).toMatch(/msgstr "Hey!"/);
    expect(helloEntry).toMatch(/msgstr "Hello!"/);
  });

  it('saves changes to descriptions', async ({page}) => {
    await page.goto('/');
    await expectPo('en.po', (poContent) => getPoEntry(poContent, '+YJVTi') != null);

    await using _ = await withTempEditApp(
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
    const content = await expectPo('en.po', (poContent) => {
      const entry = getPoEntry(poContent, '+YJVTi');
      return entry != null && entry.includes('#. Shown on home screen');
    });
    const entry = getPoEntry(content, '+YJVTi');
    expect(entry).toMatch(/#\. Shown on home screen/);
    expect(entry).toMatch(/msgid "\+YJVTi"/);
  });

  it('combines references from multiple files', async ({page}) => {
    await page.goto('/');
    const content = await expectPo('en.po', (poContent) => {
      const entry = getPoEntry(poContent, '+YJVTi');
      return (
        entry != null &&
        entry.includes('Footer.tsx') &&
        entry.includes('Greeting.tsx')
      );
    });
    const entry = getPoEntry(content, '+YJVTi');
    expect(entry).toMatch(/Footer\.tsx/);
    expect(entry).toMatch(/Greeting\.tsx/);
  });

  it('supports namespaces', async ({page}) => {
    await page.goto('/');
    await expectPo('en.po', (poContent) => getPoEntry(poContent, '+YJVTi') != null);

    await using _ = await withTempEditApp(
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
    const content = await expectPo('en.po', (poContent) => {
      const entry = getPoEntry(poContent, 'OpKKos');
      return entry != null && entry.includes('msgctxt "ui"');
    });
    const entry = getPoEntry(content, 'OpKKos');
    expect(entry).toMatch(/msgctxt "ui"\s+msgid "OpKKos"\s+msgstr "Hello!"/);
  });

  it('removes references when a message is dropped from a single file', async ({
    page
  }) => {
    await using _ = await withTempEditApp(
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
    await expectPo('en.po', (poContent) => {
      return (
        getPoEntry(poContent, '+YJVTi') != null &&
        getPoEntry(poContent, '4xqPlJ') != null
      );
    });

    await using __ = await withTempEditApp(
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
    const content = await expectPo('en.po', (poContent) => {
      const heyEntry = getPoEntry(poContent, '+YJVTi');
      const howdyEntry = getPoEntry(poContent, '4xqPlJ');
      return (
        heyEntry != null &&
        howdyEntry != null &&
        heyEntry.includes('Footer.tsx') &&
        !heyEntry.includes('Greeting.tsx')
      );
    });
    const heyEntry = getPoEntry(content, '+YJVTi');
    const howdyEntry = getPoEntry(content, '4xqPlJ');
    expect(heyEntry).toMatch(/Footer\.tsx/);
    expect(heyEntry).not.toMatch(/Greeting\.tsx/);
    expect(howdyEntry).toMatch(/Greeting\.tsx/);
  });
});

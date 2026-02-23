import path from 'path';
import {fileURLToPath} from 'url';
import {expect, test as it} from '@playwright/test';
import {
  createExtractionHelpers,
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
      return (
        poContent.includes('msgid "+YJVTi"') && poContent.includes('msgstr "Hey!"')
      );
    });
    expect(content).toContain('msgid "+YJVTi"');
    expect(content).toContain('msgstr "Hey!"');
  });

  it('saves catalog when it\'s missing', async ({page}) => {
    await page.goto('/');
    await expectPo('en.po', (poContent) => poContent.includes('msgid "+YJVTi"'));

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
        poContent.includes('msgid "+YJVTi"') &&
        poContent.includes('msgstr "Hey!"') &&
        poContent.includes('msgid "OpKKos"') &&
        poContent.includes('msgstr "Hello!"')
      );
    });
    expect(content).toContain('msgid "+YJVTi"');
    expect(content).toContain('msgid "OpKKos"');
    expect(content).toContain('msgstr "Hello!"');
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
      return (
        poContent.includes('msgid "OpKKos"') &&
        poContent.includes('msgstr "Hello!"') &&
        poContent.includes('Greeting.tsx')
      );
    });
    const greetingRefs = content.match(/#: [^\n]*Greeting\.tsx[^\n]*/g) ?? [];
    expect(content).toContain('msgid "OpKKos"');
    expect(content).toContain('msgstr "Hello!"');
    expect(greetingRefs.length).toBeGreaterThanOrEqual(2);
  });

  it('saves changes to descriptions', async ({page}) => {
    await page.goto('/');
    await expectPo('en.po', (poContent) => poContent.includes('msgid "+YJVTi"'));

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
      return (
        poContent.includes('#. Shown on home screen') &&
        poContent.includes('msgid "+YJVTi"')
      );
    });
    expect(content).toContain('#. Shown on home screen');
    expect(content).toContain('msgid "+YJVTi"');
  });

  it('combines references from multiple files', async ({page}) => {
    await page.goto('/');
    const content = await expectPo('en.po', (poContent) => {
      return (
        poContent.includes('msgid "+YJVTi"') &&
        poContent.includes('Footer.tsx') &&
        poContent.includes('Greeting.tsx')
      );
    });
    expect(content).toContain('src/components/Footer.tsx');
    expect(content).toContain('src/components/Greeting.tsx');
    expect(content).toContain('msgid "+YJVTi"');
  });

  it('supports namespaces', async ({page}) => {
    await page.goto('/');
    await expectPo('en.po', (poContent) => poContent.includes('msgid "+YJVTi"'));

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
      return (
        poContent.includes('msgctxt "ui"') && poContent.includes('msgid "OpKKos"')
      );
    });
    expect(content).toContain('msgctxt "ui"');
    expect(content).toContain('msgid "OpKKos"');
    expect(content).toContain('msgstr "Hello!"');
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
        poContent.includes('msgid "+YJVTi"') &&
        poContent.includes('msgid "4xqPlJ"')
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
      return (
        poContent.includes('msgid "+YJVTi"') &&
        poContent.includes('msgid "4xqPlJ"') &&
        poContent.includes('Footer.tsx')
      );
    });
    expect(content).toContain('msgid "+YJVTi"');
    expect(content).toContain('Footer.tsx');
    expect(content).toContain('msgid "4xqPlJ"');
  });
});

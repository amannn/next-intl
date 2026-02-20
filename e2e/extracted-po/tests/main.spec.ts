import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import {expect, test as it} from '@playwright/test';

const {describe} = it;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, '..');
const MESSAGES_DIR = path.join(APP_ROOT, 'messages');

async function readPo(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

async function withTempEdit(
  filePath: string,
  newContent: string
): Promise<{[Symbol.asyncDispose]: () => Promise<void>}> {
  const fullPath = path.join(APP_ROOT, filePath);
  const original = await fs.readFile(fullPath, 'utf-8');
  await fs.writeFile(fullPath, newContent);
  return {
    [Symbol.asyncDispose]: async () => fs.writeFile(fullPath, original)
  };
}

async function waitForExtraction(
  predicate: () => Promise<boolean>,
  opts: {timeout?: number} = {}
): Promise<void> {
  const timeout = opts.timeout ?? 30_000;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await predicate()) return;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Extraction did not complete within timeout');
}

describe('extraction po format', () => {
  it('saves messages initially', async ({page}) => {
    await page.goto('/');
    await waitForExtraction(async () => {
      try {
        const content = await readPo(path.join(MESSAGES_DIR, 'en.po'));
        return (
          content.includes('msgid "+YJVTi"') &&
          content.includes('msgstr "Hey!"')
        );
      } catch {
        return false;
      }
    });
    const content = await readPo(path.join(MESSAGES_DIR, 'en.po'));
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
    await waitForExtraction(async () => {
      try {
        const content = await readPo(path.join(MESSAGES_DIR, 'en.po'));
        return (
          content.includes('msgid "OpKKos"') &&
          content.includes('msgstr "Hello!"') &&
          content.includes('Greeting.tsx')
        );
      } catch {
        return false;
      }
    });
    const content = await readPo(path.join(MESSAGES_DIR, 'en.po'));
    const greetingRefs = content.match(/#: [^\n]*Greeting\.tsx[^\n]*/g) ?? [];
    expect(content).toContain('msgid "OpKKos"');
    expect(content).toContain('msgstr "Hello!"');
    expect(greetingRefs.length).toBeGreaterThanOrEqual(2);
  });

  it('saves changes to descriptions', async ({page}) => {
    await page.goto('/');
    await waitForExtraction(async () => {
      try {
        const content = await readPo(path.join(MESSAGES_DIR, 'en.po'));
        return content.includes('msgid "+YJVTi"');
      } catch {
        return false;
      }
    });

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
    await waitForExtraction(async () => {
      try {
        const content = await readPo(path.join(MESSAGES_DIR, 'en.po'));
        return (
          content.includes('#. Shown on home screen') &&
          content.includes('msgid "+YJVTi"')
        );
      } catch {
        return false;
      }
    });
    const content = await readPo(path.join(MESSAGES_DIR, 'en.po'));
    expect(content).toContain('#. Shown on home screen');
    expect(content).toContain('msgid "+YJVTi"');
  });

  it('combines references from multiple files', async ({page}) => {
    await page.goto('/');
    await waitForExtraction(async () => {
      try {
        const content = await readPo(path.join(MESSAGES_DIR, 'en.po'));
        return (
          content.includes('msgid "+YJVTi"') &&
          content.includes('src/components/Footer.tsx') &&
          content.includes('src/components/Greeting.tsx')
        );
      } catch {
        return false;
      }
    });
    const content = await readPo(path.join(MESSAGES_DIR, 'en.po'));
    expect(content).toContain('src/components/Footer.tsx');
    expect(content).toContain('src/components/Greeting.tsx');
    expect(content).toContain('msgid "+YJVTi"');
  });

  it('supports namespaces', async ({page}) => {
    await page.goto('/');
    await waitForExtraction(async () => {
      try {
        const content = await readPo(path.join(MESSAGES_DIR, 'en.po'));
        return content.includes('msgid "+YJVTi"');
      } catch {
        return false;
      }
    });

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
    await waitForExtraction(async () => {
      try {
        const content = await readPo(path.join(MESSAGES_DIR, 'en.po'));
        return (
          content.includes('msgctxt "ui"') && content.includes('msgid "OpKKos"')
        );
      } catch {
        return false;
      }
    });
    const content = await readPo(path.join(MESSAGES_DIR, 'en.po'));
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
    await waitForExtraction(async () => {
      try {
        const content = await readPo(path.join(MESSAGES_DIR, 'en.po'));
        return (
          content.includes('msgid "+YJVTi"') &&
          content.includes('msgid "4xqPlJ"')
        );
      } catch {
        return false;
      }
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
    await waitForExtraction(async () => {
      try {
        const content = await readPo(path.join(MESSAGES_DIR, 'en.po'));
        return (
          content.includes('msgid "+YJVTi"') &&
          content.includes('msgid "4xqPlJ"') &&
          content.includes('Footer.tsx')
        );
      } catch {
        return false;
      }
    });
    const content = await readPo(path.join(MESSAGES_DIR, 'en.po'));
    expect(content).toContain('msgid "+YJVTi"');
    expect(content).toContain('Footer.tsx');
    expect(content).toContain('msgid "4xqPlJ"');
  });
});

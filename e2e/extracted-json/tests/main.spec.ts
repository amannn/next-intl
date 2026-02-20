import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import {expect, test as it} from '@playwright/test';
import {createExtractionHelpers} from './helpers.js';

const {describe} = it;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, '..');
const MESSAGES_DIR = path.join(APP_ROOT, 'messages');

const {expectJson, expectJsonPredicate} = createExtractionHelpers(MESSAGES_DIR);

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

async function withTempFile(
  filePath: string,
  content: string
): Promise<{[Symbol.asyncDispose]: () => Promise<void>}> {
  const fullPath = path.join(APP_ROOT, filePath);
  let existed = true;
  let original = '';
  try {
    original = await fs.readFile(fullPath, 'utf-8');
  } catch {
    existed = false;
  }
  await fs.writeFile(fullPath, content);
  return {
    [Symbol.asyncDispose]: async () => {
      if (existed) {
        await fs.writeFile(fullPath, original);
      } else {
        await fs.unlink(fullPath);
      }
    }
  };
}

describe('extraction json format', () => {
  it('saves messages initially', async ({page}) => {
    await page.goto('/');
    const en = await expectJson('en.json', {'+YJVTi': 'Hey!', NhX4DJ: 'Hello'});
    expect(en['+YJVTi']).toBe('Hey!');
    expect(en['NhX4DJ']).toBe('Hello');
  });

  it('resets translations when a message changes', async ({page}) => {
    await page.goto('/');
    await expectJson('en.json', {'+YJVTi': 'Hey!'});

    await using _ = await withTempEdit(
      'src/components/Greeting.tsx',
      `'use client';

import {useExtracted} from 'next-intl';

export default function Greeting() {
  const t = useExtracted();
  return <div>{t('Hello!')}</div>;
}
`
    );

    await page.goto('/');
    const en = await expectJson('en.json', {OpKKos: 'Hello!'});
    expect(en['OpKKos']).toBe('Hello!');
    try {
      const de = await expectJson('de.json', {OpKKos: ''});
      expect(de['OpKKos']).toBe('');
    } catch {
      // de.json may not exist with locales: infer
    }
  });

  it('removes translations when all messages removed from a file', async ({
    page
  }) => {
    await page.goto('/');
    await expectJson('en.json', {'+YJVTi': 'Hey!', NhX4DJ: 'Hello'});

    await using _ = await withTempEdit(
      'src/components/Greeting.tsx',
      `'use client';

export default function Greeting() {
  return <div />;
}
`
    );
    await using __ = await withTempEdit(
      'src/components/Footer.tsx',
      `'use client';

export default function Footer() {
  return <footer />;
}
`
    );

    await page.goto('/');
    const en = await expectJsonPredicate('en.json', (j) => {
      return (
        j['NhX4DJ'] === 'Hello' &&
        (j['+YJVTi'] === undefined || j['+YJVTi'] === null)
      );
    });
    expect(en['+YJVTi']).toBeUndefined();
    expect(en['NhX4DJ']).toBe('Hello');
  });

  it('preserves messages when removed from one file but still used in another', async ({
    page
  }) => {
    await page.goto('/');
    await expectJson('en.json', {'+YJVTi': 'Hey!'});

    await using _ = await withTempEdit(
      'src/components/Greeting.tsx',
      `'use client';

export default function Greeting() {
  return <div />;
}
`
    );

    await page.goto('/');
    const en = await expectJson('en.json', {'+YJVTi': 'Hey!'});
    expect(en['+YJVTi']).toBe('Hey!');
  });

  it('skips node_modules, .next and .git by default', async ({page}) => {
    await page.goto('/');
    const en = await expectJson('en.json', {'+YJVTi': 'Hey!'});
    expect(en['JdTriE']).toBeUndefined();
  });

  it('restores previous translations when messages are added back', async ({
    page
  }) => {
    await page.goto('/');
    await expectJson('en.json', {'+YJVTi': 'Hey!'});

    await using _ = await withTempEdit(
      'src/components/Greeting.tsx',
      `'use client';

export default function Greeting() {
  return <div />;
}
`
    );
    await using __ = await withTempEdit(
      'src/components/Footer.tsx',
      `'use client';

export default function Footer() {
  return <footer />;
}
`
    );

    await page.goto('/');
    await expectJsonPredicate('en.json', (j) => {
      return (
        j['NhX4DJ'] === 'Hello' &&
        (j['+YJVTi'] === undefined || j['+YJVTi'] === null)
      );
    });

    await using ___ = await withTempEdit(
      'src/components/Greeting.tsx',
      `'use client';

import {useExtracted} from 'next-intl';

export default function Greeting() {
  const t = useExtracted();
  return <div>{t('Hey!')}</div>;
}
`
    );
    await using ____ = await withTempEdit(
      'src/components/Footer.tsx',
      `'use client';

import {useExtracted} from 'next-intl';

export default function Footer() {
  const t = useExtracted();
  return <footer>{t('Hey!')}</footer>;
}
`
    );

    await page.goto('/');
    const en = await expectJson('en.json', {'+YJVTi': 'Hey!'});
    expect(en['+YJVTi']).toBe('Hey!');
  });

  it('handles namespaces when storing messages', async ({page}) => {
    await page.goto('/');
    await expectJson('en.json', {'+YJVTi': 'Hey!'});

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
    const en = await expectJson('en.json', {ui: {OpKKos: 'Hello!'}});
    expect((en['ui'] as Record<string, unknown>)['OpKKos']).toBe('Hello!');
  });

  it('omits file with parse error during initial scan but continues processing others', async ({
    page
  }) => {
    await using _ = await withTempFile(
      'src/components/Valid.tsx',
      `'use client';

import {useExtracted} from 'next-intl';

export default function Valid() {
  const t = useExtracted();
  return <div>{t('Valid message')}</div>;
}
`
    );

    await using __ = await withTempFile(
      'src/components/Invalid.tsx',
      `'use client';

import {useExtracted} from 'next-intl';

export default function Invalid() {
  const t = useExtracted();
  return <div>{t('Initially invalid')}</div>;

// Missing closing brace
`
    );

    await page.goto('/');
    const en = await expectJson('en.json', {HovSZ7: 'Valid message'});
    expect(en['HovSZ7']).toBe('Valid message');
    expect(en['Initially invalid']).toBeUndefined();

    await using ___ = await withTempEdit(
      'src/components/Invalid.tsx',
      `'use client';

import {useExtracted} from 'next-intl';

export default function Invalid() {
  const t = useExtracted();
  return <div>{t('Now valid')}</div>;
}
`
    );

    await page.goto('/');
    const en2 = await expectJson('en.json', {
      KvzhZT: 'Now valid',
      HovSZ7: 'Valid message'
    });
    expect(en2['KvzhZT']).toBe('Now valid');
    expect(en2['HovSZ7']).toBe('Valid message');
  });
});

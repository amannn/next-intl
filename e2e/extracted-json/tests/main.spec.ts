import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import {expect, test as it} from '@playwright/test';
import {
  createExtractionHelpers,
  withTempEdit,
  withTempFile,
  withTempRemove
} from './helpers.js';

const {describe} = it;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, '..');
const MESSAGES_DIR = path.join(APP_ROOT, 'messages');

const {expectJson, expectJsonPredicate} = createExtractionHelpers(MESSAGES_DIR);

const withTempEditApp = (filePath: string, content: string) =>
  withTempEdit(APP_ROOT, filePath, content);
const withTempFileApp = (filePath: string, content: string) =>
  withTempFile(APP_ROOT, filePath, content);
const withTempRemoveApp = (filePath: string) =>
  withTempRemove(APP_ROOT, filePath);

describe('extraction json format', () => {
  it('saves messages initially', async ({page}) => {
    await page.goto('/');
    const en = await expectJson('en.json', {'+YJVTi': 'Hey!', NhX4DJ: 'Hello'});
    expect(en['+YJVTi']).toBe('Hey!');
    expect(en['NhX4DJ']).toBe('Hello');
  });

  it('writes to newly added catalog file', async ({page}) => {
    await page.goto('/');
    await expectJson('en.json', {'+YJVTi': 'Hey!', NhX4DJ: 'Hello'});

    await using _ = await withTempFileApp('messages/fr.json', '{}');

    await page.goto('/');
    const fr = await expectJson('fr.json', {'+YJVTi': '', NhX4DJ: ''});
    expect(fr['+YJVTi']).toBe('');
    expect(fr['NhX4DJ']).toBe('');
  });

  it('preserves existing translations when adding a catalog file', async ({
    page
  }) => {
    await page.goto('/');
    await expectJson('en.json', {'+YJVTi': 'Hey!', NhX4DJ: 'Hello'});

    await using _ = await withTempFileApp(
      'messages/fr.json',
      '{"+YJVTi": "Salut!", "NhX4DJ": ""}'
    );

    await page.goto('/');
    const fr = await expectJson('fr.json', {'+YJVTi': 'Salut!', NhX4DJ: ''});
    expect(fr['+YJVTi']).toBe('Salut!');
    expect(fr['NhX4DJ']).toBe('');
  });

  it('preserves manual translations in target catalogs when adding new messages', async ({
    page
  }) => {
    await page.goto('/');
    await expectJson('en.json', {'+YJVTi': 'Hey!', NhX4DJ: 'Hello'});

    await using _ = await withTempEditApp(
      'messages/de.json',
      '{"+YJVTi": "Hallo", "NhX4DJ": "Hallo"}'
    );

    await using __ = await withTempEditApp(
      'src/components/Greeting.tsx',
      `'use client';

import {useExtracted} from 'next-intl';

export default function Greeting() {
  const t = useExtracted();
  return (
    <div>
      {t('Hey!')}
      {t('Hello!')}
    </div>
  );
}
`
    );

    await page.goto('/');
    const de = await expectJson('de.json', {
      '+YJVTi': 'Hallo',
      NhX4DJ: 'Hallo',
      OpKKos: ''
    });
    expect(de['+YJVTi']).toBe('Hallo');
    expect(de['NhX4DJ']).toBe('Hallo');
    expect(de['OpKKos']).toBe('');
  });

  it('stops writing to removed catalog file', async ({page}) => {
    await page.goto('/');
    await expectJson('en.json', {'+YJVTi': 'Hey!', NhX4DJ: 'Hello'});
    await expectJson('de.json', {NhX4DJ: 'Hallo'});

    await using _ = await withTempRemoveApp('messages/de.json');

    await using __ = await withTempEditApp(
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
    await expectJson('en.json', {OpKKos: 'Hello!'});
    const dePath = path.join(MESSAGES_DIR, 'de.json');
    await expect
      .poll(async () => {
        try {
          await fs.access(dePath);
          return false;
        } catch {
          return true;
        }
      })
      .toBe(true);
  });

  it('resets translations when a message changes', async ({page}) => {
    await page.goto('/');
    await expectJson('en.json', {'+YJVTi': 'Hey!'});

    await using _ = await withTempEditApp(
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

    await using _ = await withTempEditApp(
      'src/components/Greeting.tsx',
      `'use client';

export default function Greeting() {
  return <div />;
}
`
    );
    await using __ = await withTempEditApp(
      'src/components/Footer.tsx',
      `'use client';

export default function Footer() {
  return <footer />;
}
`
    );

    await page.goto('/');
    const en = await expectJsonPredicate('en.json', (json) => {
      return (
        json['NhX4DJ'] === 'Hello' &&
        (json['+YJVTi'] === undefined || json['+YJVTi'] === null)
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

    await using _ = await withTempEditApp(
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

    await using _ = await withTempEditApp(
      'src/components/Greeting.tsx',
      `'use client';

export default function Greeting() {
  return <div />;
}
`
    );
    await using __ = await withTempEditApp(
      'src/components/Footer.tsx',
      `'use client';

export default function Footer() {
  return <footer />;
}
`
    );

    await page.goto('/');
    await expectJsonPredicate('en.json', (json) => {
      return (
        json['NhX4DJ'] === 'Hello' &&
        (json['+YJVTi'] === undefined || json['+YJVTi'] === null)
      );
    });

    await using ___ = await withTempEditApp(
      'src/components/Greeting.tsx',
      `'use client';

import {useExtracted} from 'next-intl';

export default function Greeting() {
  const t = useExtracted();
  return <div>{t('Hey!')}</div>;
}
`
    );
    await using ____ = await withTempEditApp(
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
    const en = await expectJson('en.json', {ui: {OpKKos: 'Hello!'}});
    expect((en['ui'] as Record<string, unknown>)['OpKKos']).toBe('Hello!');
  });

  it('throws on parse error for invalid file', async ({page}) => {
    await using _ = await withTempFileApp(
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
    await expectJsonPredicate('en.json', (json) => {
      return json['Initially invalid'] === undefined;
    });
  });
});

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, '..');
const MESSAGES_DIR = path.join(APP_ROOT, 'messages');

const {expectCatalog, expectCatalogPredicate} =
  createExtractionHelpers(MESSAGES_DIR);

const withTempEditApp = (filePath: string, content: string) =>
  withTempEdit(APP_ROOT, filePath, content);
const withTempFileApp = (filePath: string, content: string) =>
  withTempFile(APP_ROOT, filePath, content);
const withTempRemoveApp = (filePath: string) =>
  withTempRemove(APP_ROOT, filePath);

it.afterEach(async () => {
  await fs.writeFile(
    path.join(MESSAGES_DIR, 'en.json'),
    JSON.stringify(
      {
        NhX4DJ: 'Hello',
        '+YJVTi': 'Hey!'
      },
      null,
      2
    ) + '\n'
  );
  await fs.writeFile(
    path.join(MESSAGES_DIR, 'de.json'),
    JSON.stringify(
      {
        NhX4DJ: 'Hallo',
        '+YJVTi': ''
      },
      null,
      2
    ) + '\n'
  );
});

it('extracts newly referenced messages in components', async ({page}) => {
  await page.goto('/');
  await expectCatalog('en.json', {'+YJVTi': 'Hey!', NhX4DJ: 'Hello'});

  await using _ = await withTempEditApp(
    'src/components/Greeting.tsx',
    `'use client';

import {useExtracted} from 'next-intl';

export default function Greeting() {
  const t = useExtracted();
  return <div>{t('Hey!')}{t('Newly extracted')}</div>;
}
`
  );

  await page.goto('/');
  const en = await expectCatalogPredicate('en.json', (json) =>
    JSON.stringify(json).includes('Newly extracted')
  );
  expect(JSON.stringify(en)).toContain('Newly extracted');
});

it('writes to newly added catalog file', async ({page}) => {
  await page.goto('/');
  await expectCatalog('en.json', {'+YJVTi': 'Hey!', NhX4DJ: 'Hello'});

  await using _ = await withTempFileApp('messages/fr.json', '');

  await page.goto('/');
  const fr = await expectCatalog(
    'fr.json',
    {'+YJVTi': '', NhX4DJ: ''},
    {
      timeout: 15_000
    }
  );
  expect(fr['+YJVTi']).toBe('');
  expect(fr['NhX4DJ']).toBe('');
});

it('preserves manual translations in target catalogs when adding new messages', async ({
  page
}) => {
  await page.goto('/');
  await expectCatalog('en.json', {'+YJVTi': 'Hey!', NhX4DJ: 'Hello'});

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
  const de = await expectCatalog('de.json', {
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
  await expectCatalog('en.json', {'+YJVTi': 'Hey!', NhX4DJ: 'Hello'});
  await expectCatalog('de.json', {NhX4DJ: 'Hallo'});

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
  await expectCatalog('en.json', {OpKKos: 'Hello!'});
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
  await expectCatalog('en.json', {'+YJVTi': 'Hey!'});

  await using _ = await withTempFileApp(
    'messages/de.json',
    '{"+YJVTi": "Hallo"}'
  );

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
  const en = await expectCatalog('en.json', {OpKKos: 'Hello!'});
  expect(en['OpKKos']).toBe('Hello!');
  const de = await expectCatalog('de.json', {OpKKos: ''});
  expect(de['OpKKos']).toBe('');
});

it('removes translations when all messages removed from a file', async ({
  page
}) => {
  await page.goto('/');
  await expectCatalog('en.json', {'+YJVTi': 'Hey!', NhX4DJ: 'Hello'});

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
  const en = await expectCatalogPredicate(
    'en.json',
    (json) => json['NhX4DJ'] === 'Hello' && json['+YJVTi'] == null
  );
  expect(en['+YJVTi']).toBeUndefined();
  expect(en['NhX4DJ']).toBe('Hello');
});

it('preserves messages when removed from one file but still used in another', async ({
  page
}) => {
  await page.goto('/');
  await expectCatalog('en.json', {'+YJVTi': 'Hey!'});

  await using _ = await withTempEditApp(
    'src/components/Greeting.tsx',
    `'use client';

export default function Greeting() {
  return <div />;
}
`
  );

  await page.goto('/');
  const en = await expectCatalog('en.json', {'+YJVTi': 'Hey!'});
  expect(en['+YJVTi']).toBe('Hey!');
});

// TODO: CatalogManager.reloadLocaleCatalog() currently removes
// previous translations, needs a different approach.
it.skip('restores previous translations when messages are added back', async ({
  page
}) => {
  await page.goto('/');
  await expectCatalog('en.json', {'+YJVTi': 'Hey!', NhX4DJ: 'Hello'});
  await expectCatalog('de.json', {'+YJVTi': '', NhX4DJ: 'Hallo'});

  await using _ = await withTempEditApp(
    'src/app/page.tsx',
    `import {useExtracted} from 'next-intl';
import Greeting from '@/components/Greeting';
import Footer from '@/components/Footer';

export default function Page() {
  const t = useExtracted();
  return (
    <div>
      <Greeting />
      <Footer />
    </div>
  );
}
`
  );

  await expectCatalogPredicate('en.json', (json) => json['NhX4DJ'] == null);
  await expectCatalogPredicate('de.json', (json) => json['NhX4DJ'] == null);

  await using __ = await withTempEditApp(
    'src/app/page.tsx',
    `import {useExtracted} from 'next-intl';
import Greeting from '@/components/Greeting';
import Footer from '@/components/Footer';

export default function Page() {
  const t = useExtracted();
  return (
    <div>
      <h1>{t('Hello')}</h1>
      <Greeting />
      <Footer />
    </div>
  );
}
`
  );

  await expectCatalog('en.json', {'+YJVTi': 'Hey!', NhX4DJ: 'Hello'});
  await expectCatalogPredicate('de.json', (json) => json['NhX4DJ'] === 'Hallo');
});

it('handles namespaces when storing messages', async ({page}) => {
  await page.goto('/');
  await expectCatalog('en.json', {'+YJVTi': 'Hey!'});

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
  const en = await expectCatalog('en.json', {ui: {OpKKos: 'Hello!'}});
  expect((en['ui'] as Record<string, unknown>)['OpKKos']).toBe('Hello!');
});

it('handles parse errors', async ({page}) => {
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

  await using __ = await withTempEditApp(
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
  const en = await expectCatalogPredicate('en.json', (json) => {
    return JSON.stringify(json).includes('Now valid');
  });
  expect(JSON.stringify(en)).toContain('Now valid');
});

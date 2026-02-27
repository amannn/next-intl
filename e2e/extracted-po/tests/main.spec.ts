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
import {getPoEntry} from './helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, '..');
const MESSAGES_DIR = path.join(APP_ROOT, 'messages');

const {expectCatalog, logCatalogState} = createExtractionHelpers(MESSAGES_DIR);
const withTempEditApp = (filePath: string, content: string) =>
  withTempEdit(APP_ROOT, filePath, content);
const withTempFileApp = (filePath: string, content: string) =>
  withTempFile(APP_ROOT, filePath, content);
const withTempRemoveApp = (filePath: string) =>
  withTempRemove(APP_ROOT, filePath);

it.afterEach(async () => {
  const poHeader = (lang: string) =>
    `msgid ""
msgstr ""
"Language: ${lang}\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"

`;
  await fs.writeFile(
    path.join(MESSAGES_DIR, 'en.po'),
    poHeader('en') +
      `#: src/app/page.tsx:9
msgid "NhX4DJ"
msgstr "Hello"

#: src/components/Footer.tsx:7
msgid "+YJVTi"
msgstr "Hey!"
`
  );
  await fs.writeFile(
    path.join(MESSAGES_DIR, 'de.po'),
    poHeader('de') +
      `#: src/app/page.tsx:9
msgid "NhX4DJ"
msgstr "Hallo"

#: src/components/Footer.tsx:7
msgid "+YJVTi"
msgstr ""
`
  );
});

it('extracts newly referenced messages in components', async ({page}) => {
  await page.goto('/');
  await expectCatalog(
    'en.po',
    (content) => getPoEntry(content, '+YJVTi') != null
  );

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
  const content = await expectCatalog('en.po', (content) =>
    content.includes('Newly extracted')
  );
  expect(content).toContain('Newly extracted');
});

it('sorts messages by reference path', async ({page}) => {
  await using _ = await withTempFileApp(
    'src/components/Header.tsx',
    `'use client';

import {useExtracted} from 'next-intl';

export default function Header() {
  const t = useExtracted();
  return <div>{t('Welcome')}</div>;
}
`
  );

  await using __ = await withTempEditApp(
    'src/app/page.tsx',
    `import {useExtracted} from 'next-intl';
import Greeting from '@/components/Greeting';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function Page() {
  const t = useExtracted();
  return (
    <div>
      <h1>{t('Hello')}</h1>
      <Header />
      <Greeting />
      <Footer />
    </div>
  );
}
`
  );

  await page.goto('/');
  const content = await expectCatalog(
    'en.po',
    (c) => getPoEntry(c, 'NhX4DJ') != null && getPoEntry(c, 'PwaN2o') != null
  );
  const appIndex = content.indexOf('#: src/app/page.tsx');
  const headerIndex = content.indexOf('#: src/components/Header.tsx');
  expect(appIndex).toBeLessThan(headerIndex);
});

it('removes messages when a folder is deleted during dev', async ({page}) => {
  await using _ = await withTempFileApp(
    'src/components/Buttons/Button.tsx',
    `'use client';

import {useExtracted} from 'next-intl';

export default function Button() {
  const t = useExtracted();
  return <button>{t('Click me')}</button>;
}
`
  );

  await using __ = await withTempEditApp(
    'src/app/page.tsx',
    `import {useExtracted} from 'next-intl';
import Greeting from '@/components/Greeting';
import Footer from '@/components/Footer';
import Button from '@/components/Buttons/Button';

export default function Page() {
  const t = useExtracted();
  return (
    <div>
      <h1>{t('Hello')}</h1>
      <Greeting />
      <Footer />
      <Button />
    </div>
  );
}
`
  );

  await page.goto('/');
  const content = await expectCatalog('en.po', (c) => {
    const entry = getPoEntry(c, 'wESdnU');
    return entry != null && entry.includes('Buttons/Button.tsx');
  });
  expect(getPoEntry(content, 'wESdnU')).toMatch(/Buttons\/Button\.tsx/);

  await using ___ = await withTempEditApp(
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

  await using ____ = await withTempRemoveApp(
    'src/components/Buttons/Button.tsx'
  );

  await page.goto('/');
  const afterContent = await expectCatalog(
    'en.po',
    (c) => !c.includes('Buttons/Button.tsx') && getPoEntry(c, 'wESdnU') == null
  );
  expect(getPoEntry(afterContent, 'wESdnU')).toBeNull();
});

it('updates messages when a folder is renamed during dev', async ({page}) => {
  await using _ = await withTempFileApp(
    'src/components/old/Button.tsx',
    `'use client';

import {useExtracted} from 'next-intl';

export default function Button() {
  const t = useExtracted();
  return <button>{t('Click me')}</button>;
}
`
  );

  await using __ = await withTempEditApp(
    'src/app/page.tsx',
    `import {useExtracted} from 'next-intl';
import Greeting from '@/components/Greeting';
import Footer from '@/components/Footer';
import Button from '@/components/old/Button';

export default function Page() {
  const t = useExtracted();
  return (
    <div>
      <h1>{t('Hello')}</h1>
      <Greeting />
      <Footer />
      <Button />
    </div>
  );
}
`
  );

  await page.goto('/');
  const content = await expectCatalog('en.po', (c) => {
    const entry = getPoEntry(c, 'wESdnU');
    return entry != null && entry.includes('old/Button.tsx');
  });
  expect(getPoEntry(content, 'wESdnU')).toMatch(/old\/Button\.tsx/);

  await using ___ = await withTempFileApp(
    'src/components/new/Button.tsx',
    `'use client';

import {useExtracted} from 'next-intl';

export default function Button() {
  const t = useExtracted();
  return <button>{t('Click me updated')}</button>;
}
`
  );

  await using ____ = await withTempEditApp(
    'src/app/page.tsx',
    `import {useExtracted} from 'next-intl';
import Greeting from '@/components/Greeting';
import Footer from '@/components/Footer';
import Button from '@/components/new/Button';

export default function Page() {
  const t = useExtracted();
  return (
    <div>
      <h1>{t('Hello')}</h1>
      <Greeting />
      <Footer />
      <Button />
    </div>
  );
}
`
  );

  await using _____ = await withTempRemoveApp('src/components/old/Button.tsx');

  await page.goto('/');
  const afterContent = await expectCatalog(
    'en.po',
    (c) =>
      getPoEntry(c, 'cfI2fq') != null &&
      getPoEntry(c, 'cfI2fq')!.includes('new/Button.tsx') &&
      !c.includes('old/Button.tsx')
  );
  expect(getPoEntry(afterContent, 'cfI2fq')).toMatch(/new\/Button\.tsx/);
  expect(afterContent).not.toMatch(/old\/Button\.tsx/);
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
  const content = await expectCatalog(
    'en.po',
    (content) => getPoEntry(content, 'OpKKos') != null,
    {timeout: 15_000}
  );
  const entry = getPoEntry(content, 'OpKKos');
  expect(entry).toMatch(/msgstr "Hello!"/);
  expect(entry).toMatch(/Greeting\.tsx/);
  const greetingRefs = entry!.match(/#: [^\n]*Greeting\.tsx[^\n]*/g) ?? [];
  expect(greetingRefs.length).toBeGreaterThanOrEqual(2);
});

it('preserves flags', async ({page}) => {
  await page.goto('/');
  await expectCatalog(
    'en.po',
    (content) => getPoEntry(content, '+YJVTi') != null
  );

  await using _ = await withTempEditApp(
    'messages/en.po',
    `msgid ""
msgstr ""
"Language: en\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"

#: src/components/Greeting.tsx:5
#, fuzzy
msgid "+YJVTi"
msgstr "Hey!"
`
  );

  await using __ = await withTempEditApp(
    'messages/de.po',
    `msgid ""
msgstr ""
"Language: de\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"

#: src/components/Greeting.tsx:5
#, c-format
msgid "+YJVTi"
msgstr "Hallo!"
`
  );

  await page.goto('/');
  const enContent = await expectCatalog(
    'en.po',
    (c) => getPoEntry(c, '+YJVTi') != null
  );
  const deContent = await expectCatalog(
    'de.po',
    (c) => getPoEntry(c, '+YJVTi') != null
  );
  const enEntry = getPoEntry(enContent, '+YJVTi');
  const deEntry = getPoEntry(deContent, '+YJVTi');
  expect(enEntry).toMatch(/#, fuzzy/);
  expect(deEntry).toMatch(/#, c-format/);
});

it('removes flags when externally deleted', async ({page}) => {
  await page.goto('/');
  await expectCatalog(
    'en.po',
    (content) => getPoEntry(content, '+YJVTi') != null
  );

  await using _ = await withTempEditApp(
    'messages/en.po',
    `msgid ""
msgstr ""
"Language: en\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"

#: src/components/Greeting.tsx:5
#, fuzzy, c-format
msgid "+YJVTi"
msgstr "Hey!"
`
  );

  await using __ = await withTempEditApp(
    'messages/en.po',
    `msgid ""
msgstr ""
"Language: en\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"

#: src/components/Greeting.tsx:5
#, c-format
msgid "+YJVTi"
msgstr "Hey!"
`
  );

  await using ___ = await withTempEditApp(
    'src/components/Greeting.tsx',
    `'use client';

import {useExtracted} from 'next-intl';

export default function Greeting() {
  const t = useExtracted();
  return <div>{t('Hey!')} {t('World')}</div>;
}
`
  );

  await page.goto('/');
  const content = await expectCatalog(
    'en.po',
    (c) => getPoEntry(c, '+YJVTi') != null && getPoEntry(c, 'jqdzk6') != null
  );
  const entry = getPoEntry(content, '+YJVTi');
  expect(entry).not.toMatch(/#, fuzzy/);
  expect(entry).toMatch(/#, c-format/);
});

it('saves changes to descriptions', async ({page}) => {
  await page.goto('/');
  await expectCatalog(
    'en.po',
    (content) => getPoEntry(content, '+YJVTi') != null
  );

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
  const content = await expectCatalog('en.po', (content) => {
    const entry = getPoEntry(content, '+YJVTi');
    return entry != null && entry.includes('#. Shown on home screen');
  });
  const entry = getPoEntry(content, '+YJVTi');
  expect(entry).toMatch(/#\. Shown on home screen/);
  expect(entry).toMatch(/msgid "\+YJVTi"/);
});

it('combines references from multiple files', async ({page}) => {
  await page.goto('/');
  const content = await expectCatalog('en.po', (content) => {
    const entry = getPoEntry(content, '+YJVTi');
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
  await expectCatalog(
    'en.po',
    (content) => getPoEntry(content, '+YJVTi') != null
  );

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
  const content = await expectCatalog('en.po', (content) => {
    const entry = getPoEntry(content, 'OpKKos');
    return entry != null && entry.includes('msgctxt "ui"');
  });
  const entry = getPoEntry(content, 'OpKKos');
  expect(entry).toMatch(/msgctxt "ui"\s+msgid "OpKKos"\s+msgstr "Hello!"/);
});

it('removes references when a message is dropped from a single file', async ({
  page
}) => {
  const t0 = Date.now();
  const logStep = (step: string) => {
    if (process.env.DEBUG_EXTRACTION_PO || process.env.CI) {
      console.log(`[extraction-debug] t=${Date.now() - t0}ms ${step}`);
    }
  };

  logStep('phase1: edit Greeting to add Hey!+Howdy!');
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
  await logCatalogState('en.po', 'phase1 after edit:');

  logStep('phase1: goto');
  await page.goto('/');
  logStep('phase1: expectCatalog both entries');
  await expectCatalog(
    'en.po',
    (content) =>
      getPoEntry(content, '+YJVTi') != null &&
      getPoEntry(content, '4xqPlJ') != null
  );
  logStep('phase1 complete');

  logStep('phase2: wait networkidle');
  await page.waitForLoadState('networkidle');
  logStep('phase2: edit Greeting to remove Hey!');
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
  await logCatalogState('en.po', 'phase2 after edit (before goto):');

  logStep('phase2: touch en.po');
  const enPoPath = path.join(MESSAGES_DIR, 'en.po');
  const enPoContent = await fs.readFile(enPoPath, 'utf-8');
  await fs.writeFile(enPoPath, enPoContent);

  logStep('phase2: goto');
  await page.goto('/');
  await logCatalogState('en.po', 'phase2 after goto:');

  logStep('phase2: expectCatalog correct refs');
  const content = await expectCatalog(
    'en.po',
    (content) => {
      const heyEntry = getPoEntry(content, '+YJVTi');
      const howdyEntry = getPoEntry(content, '4xqPlJ');
      return (
        heyEntry != null &&
        howdyEntry != null &&
        heyEntry.includes('Footer.tsx') &&
        !heyEntry.includes('Greeting.tsx')
      );
    },
    {debugLabel: 'phase2-poll'}
  );
  const heyEntry = getPoEntry(content, '+YJVTi');
  const howdyEntry = getPoEntry(content, '4xqPlJ');
  expect(heyEntry).toMatch(/Footer\.tsx/);
  expect(heyEntry).not.toMatch(/Greeting\.tsx/);
  expect(howdyEntry).toMatch(/Greeting\.tsx/);
});

it('merges descriptions when message appears in multiple files with different descriptions', async ({
  page
}) => {
  await using _ = await withTempFileApp(
    'src/components/FileY.tsx',
    `'use client';

import {useExtracted} from 'next-intl';

export default function FileY() {
  const t = useExtracted();
  return (
    <div>
      {t({message: 'Message', description: 'Description from FileY'})}
    </div>
  );
}
`
  );

  await using __ = await withTempFileApp(
    'src/components/FileZ.tsx',
    `'use client';

import {useExtracted} from 'next-intl';

export default function FileZ() {
  const t = useExtracted();
  return (
    <div>
      {t('Message')}
      {t({message: 'Message', description: 'Description from FileZ'})}
    </div>
  );
}
`
  );

  await using ___ = await withTempEditApp(
    'src/app/page.tsx',
    `import {useExtracted} from 'next-intl';
import Greeting from '@/components/Greeting';
import Footer from '@/components/Footer';
import FileY from '@/components/FileY';
import FileZ from '@/components/FileZ';

export default function Page() {
  const t = useExtracted();
  return (
    <div>
      <h1>{t('Hello')}</h1>
      <Greeting />
      <Footer />
      <FileY />
      <FileZ />
    </div>
  );
}
`
  );

  await page.goto('/');
  const content = await expectCatalog(
    'en.po',
    (cur) =>
      cur.includes('Message') &&
      cur.includes('FileY.tsx') &&
      cur.includes('FileZ.tsx')
  );
  expect(
    content.includes('#. Description from FileY') ||
      content.includes('#. Description from FileZ')
  ).toBe(true);
  expect(content).toMatch(/FileY\.tsx/);
  expect(content).toMatch(/FileZ\.tsx/);
});

it('updates references after file rename during dev', async ({page}) => {
  await using _ = await withTempFileApp(
    'src/components/OldName.tsx',
    `'use client';

import {useExtracted} from 'next-intl';

export default function OldName() {
  const t = useExtracted();
  return <div>{t('Rename test')}</div>;
}
`
  );

  await page.goto('/');
  await expectCatalog('en.po', (content) => content.includes('OldName.tsx'));

  await using __ = await withTempFileApp(
    'src/components/NewName.tsx',
    `'use client';

import {useExtracted} from 'next-intl';

export default function NewName() {
  const t = useExtracted();
  return <div>{t('Rename test')}</div>;
}
`
  );

  await using ___ = await withTempRemoveApp('src/components/OldName.tsx');

  await page.goto('/');
  const content = await expectCatalog(
    'en.po',
    (c) => c.includes('NewName.tsx') && !c.includes('OldName.tsx')
  );
  expect(content).toMatch(/NewName\.tsx/);
  expect(content).not.toMatch(/OldName\.tsx/);
});

it('retains metadata when saving back to file', async ({page}) => {
  await page.goto('/');
  await expectCatalog('en.po', (c) => getPoEntry(c, '+YJVTi') != null);

  await using _ = await withTempEditApp(
    'messages/en.po',
    `msgid ""
msgstr ""
"POT-Creation-Date: 2025-10-27 16:00+0000\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"X-Generator: some-po-editor\\n"
"X-Something-Else: test\\n"
"Language: en\\n"

#: src/components/Greeting.tsx:5
msgid "+YJVTi"
msgstr "Hey!"
`
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
  const content = await expectCatalog(
    'en.po',
    (content) =>
      content.includes('X-Something-Else: test') &&
      content.includes('some-po-editor')
  );
  expect(content).toMatch(/X-Something-Else: test/);
  expect(content).toMatch(/some-po-editor/);
});

it('initializes all messages to empty string when adding new catalog', async ({
  page
}) => {
  await page.goto('/');
  await expectCatalog(
    'en.po',
    (content) =>
      getPoEntry(content, '+YJVTi') != null &&
      getPoEntry(content, 'NhX4DJ') != null
  );

  await using _ = await withTempFileApp('messages/fr.po', '');

  await page.goto('/');
  await expectCatalog(
    'fr.po',
    (content) =>
      getPoEntry(content, '+YJVTi') != null &&
      getPoEntry(content, 'NhX4DJ') != null
  );
});

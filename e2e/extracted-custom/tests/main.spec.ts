import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import {expect, test as it} from '@playwright/test';
import {
  createExtractionHelpers,
  getPoEntryByMsgctxt,
  withTempEdit
} from './helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, '..');
const MESSAGES_DIR = path.join(APP_ROOT, 'messages');

const {expectCatalog} = createExtractionHelpers(MESSAGES_DIR);
const withTempEditApp = (filePath: string, content: string) =>
  withTempEdit(APP_ROOT, filePath, content);

it.afterEach(async () => {
  await fs.writeFile(
    path.join(MESSAGES_DIR, 'en.po'),
    `msgid ""
msgstr ""
"Language: en\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"X-Generator: next-intl\\n"

#: src/app/page.tsx:9
msgctxt "NhX4DJ"
msgid "Hello"
msgstr "Hello"

#: src/components/Footer.tsx:7
#: src/components/Greeting.tsx:7
msgctxt "+YJVTi"
msgid "Hey!"
msgstr "Hey!"
`
  );
  await fs.writeFile(
    path.join(MESSAGES_DIR, 'de.po'),
    `msgid ""
msgstr ""
"Language: de\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"X-Generator: next-intl\\n"

#: src/app/page.tsx:9
msgctxt "NhX4DJ"
msgid "Hello"
msgstr "Hallo"

#: src/components/Footer.tsx:7
#: src/components/Greeting.tsx:7
msgctxt "+YJVTi"
msgid "Hey!"
msgstr ""
`
  );
});

it('supports custom PO format that uses source messages as msgid', async ({
  page
}) => {
  await page.goto('/');
  await expectCatalog('en.po', (c) => getPoEntryByMsgctxt(c, '+YJVTi') != null);

  await using _ = await withTempEditApp(
    'src/components/Greeting.tsx',
    `'use client';

import {useExtracted} from 'next-intl';

export default function Greeting() {
  const t = useExtracted();
  return (
    <div>
      {t('Hello!')}
      {t("The code you entered is incorrect. Please try again or contact support@example.com.")}
      {t("Checking if you're logged in.")}
    </div>
  );
}
`
  );

  await page.goto('/');
  const content = await expectCatalog(
    'en.po',
    (c) =>
      getPoEntryByMsgctxt(c, 'OpKKos') != null &&
      getPoEntryByMsgctxt(c, 'l6ZjWT') != null &&
      getPoEntryByMsgctxt(c, 'Fp6Fab') != null,
    {timeout: 15_000}
  );
  const helloEntry = getPoEntryByMsgctxt(content, 'OpKKos');
  expect(helloEntry).toMatch(/msgid "Hello!"/);
  expect(helloEntry).toMatch(/msgstr "Hello!"/);
  const longEntry = getPoEntryByMsgctxt(content, 'l6ZjWT');
  expect(longEntry).toMatch(/msgid "The code you entered is incorrect/);
});

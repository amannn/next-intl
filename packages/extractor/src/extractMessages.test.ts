import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import {afterEach, beforeEach, expect, it} from 'vite-plus/test';
import extractMessages from './extractMessages.js';
import type {ExtractorConfig} from './types.js';

let projectRoot: string;

beforeEach(async () => {
  projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'extract-messages-'));
});

afterEach(async () => {
  await fs.rm(projectRoot, {recursive: true, force: true});
});

async function writeFiles(files: Record<string, string>) {
  for (const [filePath, content] of Object.entries(files)) {
    const absolutePath = path.join(projectRoot, filePath);
    await fs.mkdir(path.dirname(absolutePath), {recursive: true});
    await fs.writeFile(absolutePath, content);
  }
}

function readFile(filePath: string) {
  return fs.readFile(path.join(projectRoot, filePath), 'utf8');
}

function extract(format: 'json' | 'po') {
  const config: ExtractorConfig = {
    extract: {
      locales: 'infer',
      path: './messages',
      sourceLocale: 'en',
      srcPath: './src'
    },
    messages: {format, path: ['./messages']}
  };
  return extractMessages(config, {projectRoot});
}

function poHeader(locale: string) {
  return `msgid ""
msgstr ""
"Language: ${locale}\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"X-Generator: next-intl\\n"
"X-Message-Key: msgctxt\\n"
`;
}

it('writes the messages of all files to every locale', async () => {
  await writeFiles({
    'src/b.tsx': `
      import {useExtracted} from 'next-intl';
      function B() {
        const t = useExtracted();
        return <div>{t('Howdy!')}{t({message: 'Save', description: 'Button'})}</div>;
      }
    `,
    'src/a.tsx': `
      import {useExtracted} from 'next-intl';
      function A() {
        const t = useExtracted();
        return <div>{t('Hello!')}{t({message: 'Save', description: 'Menu'})}</div>;
      }
    `,
    'src/plain.tsx': `export default function Plain() {}`,
    'messages/en.json': '{}',
    'messages/de.json': '{"OpKKos": "Hallo!", "unused": "Unbenutzt"}'
  });

  await extract('json');

  expect(await readFile('messages/en.json')).toMatchInlineSnapshot(`
    "{
      "OpKKos": "Hello!",
      "jvo0vs": "Save",
      "4xqPlJ": "Howdy!"
    }
    "
  `);
  expect(await readFile('messages/de.json')).toMatchInlineSnapshot(`
    "{
      "OpKKos": "Hallo!",
      "jvo0vs": "",
      "4xqPlJ": ""
    }
    "
  `);
});

it('removes obsolete messages', async () => {
  await writeFiles({
    'messages/en.po': `${poHeader('en')}
#: src/component-a.tsx
msgctxt "OpKKos"
msgid "Hello!"
msgstr "Hello!"
`,
    'messages/de.po': `${poHeader('de')}
#: src/component-a.tsx
msgctxt "OpKKos"
msgid "Hello!"
msgstr "Hallo!"
`,
    'src/component-b.tsx': `
    import {useExtracted} from 'next-intl';
    function Component() {
      const t = useExtracted();
      return <div>{t('Howdy!')}</div>;
    }
    `
  });

  await extract('po');

  expect(await readFile('messages/en.po')).toBe(`${poHeader('en')}
#: src/component-b.tsx
msgctxt "4xqPlJ"
msgid "Howdy!"
msgstr "Howdy!"
`);
  expect(await readFile('messages/de.po')).toBe(`${poHeader('de')}
#: src/component-b.tsx
msgctxt "4xqPlJ"
msgid "Howdy!"
msgstr ""
`);
});

it('updates references and keeps translations after a file rename', async () => {
  await writeFiles({
    'messages/en.po': `${poHeader('en')}
#: src/component-a.tsx
#, fuzzy
msgctxt "OpKKos"
msgid "Hello!"
msgstr "Hello!"
`,
    'messages/de.po': `${poHeader('de')}
#: src/component-a.tsx
msgctxt "OpKKos"
msgid "Hello!"
msgstr "Hallo!"
`,
    'src/component-b.tsx': `
    import {useExtracted} from 'next-intl';
    function Component() {
      const t = useExtracted();
      return <div>{t('Hello!')}</div>;
    }
    `
  });

  await extract('po');

  expect(await readFile('messages/en.po')).toBe(`${poHeader('en')}
#: src/component-b.tsx
#, fuzzy
msgctxt "OpKKos"
msgid "Hello!"
msgstr "Hello!"
`);
  expect(await readFile('messages/de.po')).toBe(`${poHeader('de')}
#: src/component-b.tsx
msgctxt "OpKKos"
msgid "Hello!"
msgstr "Hallo!"
`);
});

it('rejects a catalog that contains an array', async () => {
  await writeFiles({
    'src/Greeting.tsx': `
      import {useExtracted} from 'next-intl';
      function Greeting() {
        const t = useExtracted();
        return <div>{t('Hello!')}</div>;
      }
    `,
    'messages/en.json': '{"items": ["One", "Two"]}'
  });

  await expect(extract('json')).rejects.toThrowError(/resolved to an array/);
});

it('rejects a catalog in the previous key-based layout', async () => {
  await writeFiles({
    'src/Greeting.tsx': `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hello!')}</div>;
    }
    `,
    'messages/en.po': `msgid ""
msgstr ""
"Language: en\\n"
"X-Crowdin-SourceKey: msgstr\\n"

#: src/Greeting.tsx
msgid "OpKKos"
msgstr "Hello!"
`
  });

  await expect(extract('po')).rejects.toThrowError(/previous PO layout/);
});

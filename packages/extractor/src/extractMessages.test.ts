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

function extract(
  format: 'json' | 'po',
  {
    codes,
    mdx,
    locales = 'infer',
    path: messagesPath = './messages'
  }: Partial<
    Pick<ExtractorConfig['extract'], 'locales' | 'path' | 'mdx'> &
      Pick<ExtractorConfig['messages'], 'codes'>
  > = {}
) {
  const config: ExtractorConfig = {
    extract: {
      locales,
      path: messagesPath,
      sourceLocale: 'en',
      srcPath: './src',
      mdx
    },
    messages: {format, path: ['./messages'], codes}
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

it('writes nothing and names the file when a file fails to parse', async () => {
  await writeFiles({
    'src/Valid.tsx': `
    import {useExtracted} from 'next-intl';
    function Valid() {
      const t = useExtracted();
      return <div>{t('Valid message')}</div>;
    }
    `,
    'src/Invalid.tsx': `
    import {useExtracted} from 'next-intl';
    function Invalid() {
      const t = useExtracted();
      return <div>{t('Invalid')}</div>;
    `,
    'messages/en.json': '{}'
  });

  await expect(extract('json')).rejects.toThrow('src/Invalid.tsx');
  expect(await readFile('messages/en.json')).toBe('{}');
});

it('supports an absolute messages path', async () => {
  await writeFiles({
    'src/a.tsx': `
      import {useExtracted} from 'next-intl';
      function A() {
        const t = useExtracted();
        return <div>{t('Hello!')}</div>;
      }
    `,
    'messages/de.json': '{"OpKKos": "Hallo!"}'
  });

  await extract('json', {path: path.join(projectRoot, 'messages')});

  expect(JSON.parse(await readFile('messages/en.json'))).toEqual({
    OpKKos: 'Hello!'
  });
  expect(JSON.parse(await readFile('messages/de.json'))).toEqual({
    OpKKos: 'Hallo!'
  });
});

const greeting = `
  import {useExtracted} from 'next-intl';
  function Greeting() {
    const t = useExtracted();
    return <div>{t('Hello!')}</div>;
  }
`;

it('writes separate source and target paths', async () => {
  await writeFiles({
    'src/Greeting.tsx': greeting,
    'i18n/Messages.json': '{}',
    'i18n/Messages_de.json': '{\n  "OpKKos": "Hallo!"\n}\n'
  });

  const result = await extract('json', {
    path: {source: './i18n/Messages', targets: './i18n/Messages_{locale}'}
  });

  expect(result).toEqual({
    messageCount: 1,
    files: [
      {
        locale: 'en',
        filePath: path.join(projectRoot, 'i18n/Messages.json'),
        updated: true
      },
      {
        locale: 'de',
        filePath: path.join(projectRoot, 'i18n/Messages_de.json'),
        updated: false
      }
    ]
  });

  expect(JSON.parse(await readFile('i18n/Messages.json'))).toEqual({
    OpKKos: 'Hello!'
  });
  expect(JSON.parse(await readFile('i18n/Messages_de.json'))).toEqual({
    OpKKos: 'Hallo!'
  });
});

it('maps locales to codes in the path', async () => {
  await writeFiles({
    'src/Greeting.tsx': greeting,
    'res/values-b+es+419/strings.json': '{"OpKKos": "¡Hola!", "unused": "x"}'
  });

  await extract('json', {
    path: './res/values-{code}/strings',
    codes: {'es-419': 'b+es+419'},
    locales: ['en', 'es-419']
  });

  expect(JSON.parse(await readFile('res/values-en/strings.json'))).toEqual({
    OpKKos: 'Hello!'
  });
  expect(
    JSON.parse(await readFile('res/values-b+es+419/strings.json'))
  ).toEqual({OpKKos: '¡Hola!'});
});

it('rejects a path that splits messages by namespace', async () => {
  await writeFiles({'src/Greeting.tsx': greeting});

  await expect(
    extract('json', {path: './locales/{locale}/{namespace}'})
  ).rejects.toThrowError(/doesn't support yet/);
});

it.each(['json', 'po'] as const)(
  'extracts local MDX directly to %s catalogs',
  async (format) => {
    await writeFiles({
      'src/content/page.mdx':
        "export const metadata = {title: t({id: 'seo', message: 'Title', description: 'SEO'})};\n\n# {t('Hello!')}",
      'src/Component.tsx':
        "import {useExtracted} from 'next-intl'; function Component() {const t = useExtracted(); return t('Hello!');}",
      ['messages/de.' + format]:
        format === 'json'
          ? '{"OpKKos": "Hallo!"}'
          : `${poHeader('de')}
msgctxt "OpKKos"
msgid "Hello!"
msgstr "Hallo!"
`
    });

    const result = await extract(format, {mdx: true});
    expect(result.messageCount).toBe(2);
    const source = await readFile('messages/en.' + format);
    const target = await readFile('messages/de.' + format);
    if (format === 'json') {
      expect(JSON.parse(source)).toEqual({seo: 'Title', OpKKos: 'Hello!'});
      expect(JSON.parse(target)).toEqual({seo: '', OpKKos: 'Hallo!'});
    } else {
      expect(source).toContain('#: src/content/page.mdx');
      expect(source).toContain('#. SEO');
      expect(target).toContain('msgstr "Hallo!"');
    }
  }
);

it('ignores MDX by default and leaves catalogs untouched when enabled MDX cannot be parsed', async () => {
  await writeFiles({
    'src/page.mdx': "# {t('Hello!')}\n\n{invalid",
    'messages/en.json': '{}'
  });
  expect((await extract('json')).messageCount).toBe(0);
  const previous = await readFile('messages/en.json');
  await expect(extract('json', {mdx: true})).rejects.toThrow('src/page.mdx');
  expect(await readFile('messages/en.json')).toBe(previous);
});

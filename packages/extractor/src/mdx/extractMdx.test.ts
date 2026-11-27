import {compile} from '@mdx-js/mdx';
import {describe, expect, it} from 'vite-plus/test';
import MessageExtractor from '../extractor/MessageExtractor.js';
import recmaExtracted from './recmaExtracted.js';

function extract(source: string, mdx = true) {
  return new MessageExtractor({projectRoot: '/project', mdx}).extract(
    '/project/content/page.mdx',
    source
  );
}

it('extracts implicit messages from Markdown and JSX without extracting plain text or code', async () => {
  const source = `import Button from './Button.js';

# {t('Heading')}

Plain text with **{t('Bold')}** and _{t('Italic')}_.

- {t('List')}

> {t('Quote')}

<Button title={t('Title')}>{t('Button')}</Button>

\`t('Inline code')\`

\`\`\`js
{t('Code block')}
\`\`\`
`;
  expect((await extract(source)).map(({message}) => message)).toEqual([
    'Heading',
    'Bold',
    'Italic',
    'List',
    'Quote',
    'Title',
    'Button'
  ]);
});

it('reuses the existing message IDs and message API', async () => {
  const expressions = [
    "t('Hello {name}', {name: 'Jane'})",
    "t({id: 'save', message: 'Save', description: 'Button', values: {}, formats: {}})",
    "t.rich('<b>Hello</b>', {b: (chunks) => <strong>{chunks}</strong>})",
    "t.markup('Markup')",
    "t.has('Exists')",
    't(`Static template`)'
  ];
  const actual = await extract(
    expressions.map((code) => `{${code}}`).join('\n\n')
  );
  const expected = await new MessageExtractor({
    projectRoot: '/project'
  }).extract(
    '/project/Component.tsx',
    `import {useExtracted} from 'next-intl';
    function Component() {
      const t = useExtracted();
      ${expressions.join(';\n')};
    }`
  );
  function withoutReferences(messages: typeof actual) {
    return messages.map(({id, message, description}) => ({
      id,
      message,
      description
    }));
  }
  expect(withoutReferences(actual)).toEqual(withoutReferences(expected));
  expect(actual[1]).toMatchObject({id: 'save', description: 'Button'});
});

it('reports original positions for metadata, multiline messages and repeated calls after Unicode', async () => {
  const source = `export const metadata = {
  title: t({id: 'seo', message: 'Page title', description: 'SEO'})
};

😀 {t('Same')} {t('Same')}

{t({
  message: 'Multiline'
})}
`;
  const messages = await extract(source);
  expect(messages.map(({reference}) => reference)).toEqual([
    {path: 'content/page.mdx', line: 2, column: 9},
    {path: 'content/page.mdx', line: 5, column: 4},
    {path: 'content/page.mdx', line: 5, column: 16},
    {path: 'content/page.mdx', line: 7, column: 1}
  ]);
  expect(messages[1].id).toBe(messages[2].id);
});

it('ignores MDX unless explicitly enabled', async () => {
  expect(await extract("# {t('Hello')}\n\n{invalid", false)).toEqual([]);
});

it('does not evaluate MDX modules during extraction', async () => {
  expect(
    await extract(
      "export const unused = (() => {throw new Error('Executed')})();\n\n# {t('Safe')}"
    )
  ).toMatchObject([{message: 'Safe'}]);
});

it('keeps explicit extraction hooks in exported helpers working', async () => {
  expect(
    await extract(`import {useExtracted} from 'next-intl';

export function Example() {
  const t = useExtracted('example');
  return t('Hello');
}

<Example />`)
  ).toMatchObject([{id: 'example.NhX4DJ', message: 'Hello'}]);
});

it('converts translated metadata and preserves other exports', async () => {
  const result = String(
    await compile(
      `export const metadata = {title: t('Title')}, other = 42;

# {t('Hello')}`,
      {recmaPlugins: [recmaExtracted]}
    )
  );
  expect(result).toContain('export const other = 42');
  expect(result).toContain('export async function generateMetadata()');
  expect(result).toContain('await getExtracted()');
  expect(result).toContain('const t = useExtracted()');
  expect(result).not.toContain('export const metadata');
});

it('leaves untranslated metadata untouched', async () => {
  const result = String(
    await compile("export const metadata = {title: 'Static'};\n\n# Static", {
      recmaPlugins: [recmaExtracted]
    })
  );
  expect(result).toContain('export const metadata');
  expect(result).not.toContain('next-intl');
});

it('reuses aliased imports and avoids existing names', async () => {
  const result = String(
    await compile(
      `import {useExtracted as extracted} from 'next-intl';

export const useExtracted = 1;

# {t('Hello')}`,
      {recmaPlugins: [recmaExtracted]}
    )
  );
  expect(result).toContain('const t = extracted()');
  expect(result.match(/from ['"]next-intl['"]/g)).toHaveLength(1);
});

it('can be applied repeatedly without duplicating translators or metadata', async () => {
  const result = String(
    await compile(
      "export const metadata = {title: t('Title')};\n\n# {t('Hello')}",
      {
        recmaPlugins: [
          () => {
            const transform = recmaExtracted();
            return (program, file) => {
              transform(program, file);
              transform(program, file);
            };
          }
        ]
      }
    )
  );
  expect(result.match(/const t = useExtracted\(\)/g)).toHaveLength(1);
  expect(result.match(/async function generateMetadata/g)).toHaveLength(1);
});

describe('invalid MDX messages', () => {
  it.each([
    ["import t from './translator.js';\n\n# {t('Hello')}", 'reserved'],
    ["# {((t) => t('Hello'))(other)}", 'reserved'],
    ["# {t.raw('Hello')}", 't.rich'],
    ["# {t?.('Hello')}", 'optional'],
    ["# {t?.rich('Hello')}", 'optional'],
    ["# {await t('Hello')}", 'synchronous'],
    ['# {t(message)}', 'statically'],
    ["export let metadata = {title: t('Title')};", 'export const metadata'],
    [
      "export const metadata = {title: t('Title')};\n\nexport function generateMetadata() {}",
      'generateMetadata'
    ],
    [
      "export const metadata = {title: t('Title')};\nexport {metadata as data};",
      'referenced'
    ],
    [
      "export const metadata = {title: t('Title')};\n\nexport * from './other.js';",
      'export *'
    ]
  ])('rejects %s', async (source, error) => {
    await expect(extract(source)).rejects.toThrow(error);
  });
});

it('generates import aliases when hook names are already used', async () => {
  const result = String(
    await compile(
      `export const useExtracted = 1, _useExtracted = 2, getExtracted = 3;

export const metadata = {title: t('Title')};

# {t('Hello')}`,
      {recmaPlugins: [recmaExtracted]}
    )
  );
  expect(result).toContain('useExtracted as _useExtracted2');
  expect(result).toContain('getExtracted as _getExtracted');
  expect(result).toContain('const t = _useExtracted2()');
});

it.each([
  'export function example(metadata) {return metadata;}',
  'export function example() {const metadata = {}; return metadata;}',
  "export const example = {metadata: 'property'};",
  'export function example(object) {return object.metadata;}'
])('allows unrelated uses of metadata: %s', async (other) => {
  const messages = await extract(
    `export const metadata = {title: t('Title')};\n\n${other}`
  );
  expect(messages).toMatchObject([{message: 'Title'}]);
});

it.each([
  'export const example = metadata;',
  'export const example = {metadata};',
  'export function example() {return metadata;}',
  'export const example = object[metadata];'
])('rejects references to translated metadata: %s', async (other) => {
  await expect(
    extract(`export const metadata = {title: t('Title')};\n\n${other}`)
  ).rejects.toThrow('referenced');
});

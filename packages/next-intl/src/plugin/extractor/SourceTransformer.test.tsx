import {expect, it} from 'vitest';
import SourceTransformer from './SourceTransformer.js';

async function transform(
  code: string,
  opts?: Partial<ConstructorParameters<typeof SourceTransformer>[0]>
) {
  return await new SourceTransformer({
    isDevelopment: true,
    projectRoot: '/project',
    ...opts
  }).transform('/project/test.tsx', code);
}

it('can transform with source maps', async () => {
  const result = await transform(
    `import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t("Hello!");
    }
  `,
    {sourceMap: true}
  );

  expect(result.map).toMatchInlineSnapshot(
    `"{"version":3,"sources":["/project/test.tsx"],"sourcesContent":["import {useExtracted} from 'next-intl';\\n\\n    function Component() {\\n      const t = useExtracted();\\n      t(\\"Hello!\\");\\n    }\\n  "],"names":["useExtracted","Component","t"],"mappings":"AAAA,SAAQA,oCAAY,QAAO,YAAY;AAEnC,SAASC;IACP,MAAMC,IAAIF;IACVE,EAAE;AACJ"}"`
  );

  expect(result.map).not.toContain('<anon>');
});

it('supports destructuring from `Promise.all`', async () => {
  const result = await transform(
    `import {getExtracted, getTranslations} from 'next-intl/server';

    async function Component() {
      const [t, nav] = await Promise.all([
        getExtracted(),
        getTranslations('Navigation')
      ]);
      t('Hello!');
      nav('title');
    }
  `
  );

  expect(result.code).toMatchInlineSnapshot(`
    "import { getTranslations as getTranslations$1, getTranslations } from 'next-intl/server';
    async function Component() {
        const [t, nav] = await Promise.all([
            getTranslations$1(),
            getTranslations('Navigation')
        ]);
        t("OpKKos", void 0, void 0, "Hello!");
        nav('title');
    }
    "
  `);
});

it('does not add a fallback message in production', async () => {
  const result = await transform(
    `import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t("Hey!");
    }
  `,
    {isDevelopment: false}
  );

  expect(result).toMatchInlineSnapshot(`
    {
      "code": "import { useTranslations as useTranslations$1 } from 'next-intl';
    function Component() {
        const t = useTranslations$1();
        t("-YJVTi");
    }
    ",
      "map": undefined,
    }
  `);
});

it('leaves files without extracted messages untouched', async () => {
  const code = `import {useTranslations} from 'next-intl';`;
  expect(await transform(code)).toEqual({code});
});

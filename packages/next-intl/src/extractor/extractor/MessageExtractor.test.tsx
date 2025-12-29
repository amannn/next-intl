import {describe, expect, it} from 'vitest';
import MessageExtractor from './MessageExtractor.js';

async function process(
  code: string,
  opts?: Partial<ConstructorParameters<typeof MessageExtractor>[0]>
) {
  return await new MessageExtractor({
    isDevelopment: true,
    projectRoot: '/project',
    ...opts
  }).extract('/project/test.tsx', code);
}

it('can extract with source maps', async () => {
  const result = await process(
    `import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t("Hello!");
    }
  `,
    {sourceMap: true}
  );

  expect(result.map).toMatchInlineSnapshot(
    `"{"version":3,"sources":["test.tsx"],"sourcesContent":["import {useExtracted} from 'next-intl';\\n\\n    function Component() {\\n      const t = useExtracted();\\n      t(\\"Hello!\\");\\n    }\\n  "],"names":["useExtracted","Component","t"],"mappings":"AAAA,SAAQA,oCAAY,QAAO,YAAY;AAEnC,SAASC;IACP,MAAMC,IAAIF;IACVE,EAAE;AACJ"}"`
  );

  expect(result.map).not.toContain('<anon>');
});

it('extracts same message used multiple times in one file with all references', async () => {
  const result = await process(
    `import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      return (
        <div>
          {t('Hello!')}
          <span>{t('Hello!')}</span>
        </div>
      );
    }
  `
  );

  expect(result.messages).toMatchInlineSnapshot(`
    [
      {
        "description": null,
        "id": "OpKKos",
        "message": "Hello!",
        "references": [
          {
            "line": 7,
            "path": "test.tsx",
          },
          {
            "line": 8,
            "path": "test.tsx",
          },
        ],
      },
    ]
  `);
});

it('does not add a fallback message in production', async () => {
  const result = await process(
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
        t("+YJVTi");
    }
    ",
      "map": undefined,
      "messages": [
        {
          "description": null,
          "id": "+YJVTi",
          "message": "Hey!",
          "references": [
            {
              "line": 5,
              "path": "test.tsx",
              "line": 5,
            },
          ],
        },
      ],
    }
  `);
});

describe('error handling', () => {
  it('throws when using a template literal with interpolation', async () => {
    await expect(async () => {
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      const name = 'Alice';
      t(\`Hello \${name}!\`);
    }
    `
      );
    }).rejects.toThrow(
      'Cannot extract message from dynamic expression, messages need to be statically analyzable. If you need to provide runtime values, pass them as a separate argument.'
    );
  });

  it('throws when using string concatenation with +', async () => {
    await expect(async () => {
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      const name = 'Alice';
      t('Hello ' + name + '!');
    }
    `
      );
    }).rejects.toThrow(
      'Cannot extract message from dynamic expression, messages need to be statically analyzable. If you need to provide runtime values, pass them as a separate argument.'
    );
  });

  it('throws when using a ternary expression', async () => {
    await expect(async () => {
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component({isAdmin}) {
      const t = useExtracted();
      t(isAdmin ? 'Admin panel' : 'User panel');
    }
    `
      );
    }).rejects.toThrow(
      'Cannot extract message from dynamic expression, messages need to be statically analyzable. If you need to provide runtime values, pass them as a separate argument.'
    );
  });

  it('throws when using a variable reference', async () => {
    await expect(async () => {
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      const message = 'Hello world';
      t(message);
    }
    `
      );
    }).rejects.toThrow(
      'Cannot extract message from dynamic expression, messages need to be statically analyzable. If you need to provide runtime values, pass them as a separate argument.'
    );
  });

  it('throws when using a function call', async () => {
    await expect(async () => {
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t(getMessage());
    }
    `
      );
    }).rejects.toThrow(
      'Cannot extract message from dynamic expression, messages need to be statically analyzable. If you need to provide runtime values, pass them as a separate argument.'
    );
  });

  it('throws when using a dynamic expression with object syntax', async () => {
    await expect(async () => {
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t({id: 'test', message: getMessage()});
    }
    `
      );
    }).rejects.toThrow(
      'Cannot extract message from dynamic expression, messages need to be statically analyzable. If you need to provide runtime values, pass them as a separate argument.'
    );
  });
});

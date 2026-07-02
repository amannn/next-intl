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

it('extracts same message used multiple times in one file as separate source messages', async () => {
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
        "argumentRange": {
          "end": 150,
          "start": 142,
        },
        "description": null,
        "descriptionRange": undefined,
        "id": "OpKKos",
        "idRange": undefined,
        "message": "Hello!",
        "messageRange": {
          "end": 150,
          "start": 142,
        },
        "reference": {
          "line": 7,
          "path": "test.tsx",
        },
      },
      {
        "argumentRange": {
          "end": 180,
          "start": 172,
        },
        "description": null,
        "descriptionRange": undefined,
        "id": "OpKKos",
        "idRange": undefined,
        "message": "Hello!",
        "messageRange": {
          "end": 180,
          "start": 172,
        },
        "reference": {
          "line": 8,
          "path": "test.tsx",
        },
      },
    ]
  `);
});

it('keeps descriptions on separate source message uses', async () => {
  const result = await process(
    `import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      return (
        <div>
          {t({message: 'Save', description: 'Button label'})}
          {t({message: 'Save', description: 'Menu item label'})}
        </div>
      );
    }
  `
  );

  expect(result.messages).toMatchInlineSnapshot(`
    [
      {
        "argumentRange": {
          "end": 188,
          "start": 142,
        },
        "description": "Button label",
        "descriptionRange": {
          "end": 187,
          "start": 173,
        },
        "id": "jvo0vs",
        "idRange": undefined,
        "message": "Save",
        "messageRange": {
          "end": 158,
          "start": 152,
        },
        "reference": {
          "line": 7,
          "path": "test.tsx",
        },
      },
      {
        "argumentRange": {
          "end": 253,
          "start": 204,
        },
        "description": "Menu item label",
        "descriptionRange": {
          "end": 252,
          "start": 235,
        },
        "id": "jvo0vs",
        "idRange": undefined,
        "message": "Save",
        "messageRange": {
          "end": 220,
          "start": 214,
        },
        "reference": {
          "line": 8,
          "path": "test.tsx",
        },
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
        t("-YJVTi");
    }
    ",
      "map": undefined,
      "messages": [
        {
          "argumentRange": {
            "end": 114,
            "start": 108,
          },
          "description": null,
          "descriptionRange": undefined,
          "id": "-YJVTi",
          "idRange": undefined,
          "message": "Hey!",
          "messageRange": {
            "end": 114,
            "start": 108,
          },
          "reference": {
            "line": 5,
            "path": "test.tsx",
          },
        },
      ],
    }
  `);
});

describe('error handling', () => {
  it('throws when source has parse error', async () => {
    await expect(
      process(
        `'use client';
import {useExtracted} from 'next-intl';
export default function Invalid() {
  const t = useExtracted();
  return <div>{t('Initially invalid')}</div>;
// Missing closing brace
`
      )
    ).rejects.toThrow();
  });

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

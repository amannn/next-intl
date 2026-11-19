import {describe, expect, it} from 'vite-plus/test';
import MessageExtractor from './MessageExtractor.js';

async function process(code: string) {
  return await new MessageExtractor({projectRoot: '/project'}).extract(
    '/project/test.tsx',
    code
  );
}

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

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "description": null,
        "id": "OpKKos",
        "message": "Hello!",
        "reference": {
          "column": 11,
          "line": 7,
          "path": "test.tsx",
        },
      },
      {
        "description": null,
        "id": "OpKKos",
        "message": "Hello!",
        "reference": {
          "column": 17,
          "line": 8,
          "path": "test.tsx",
        },
      },
    ]
  `);
});

it('supports destructuring from `Promise.all`', async () => {
  const result = await process(
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

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "description": null,
        "id": "OpKKos",
        "message": "Hello!",
        "reference": {
          "column": 6,
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

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "description": "Button label",
        "id": "jvo0vs",
        "message": "Save",
        "reference": {
          "column": 11,
          "line": 7,
          "path": "test.tsx",
        },
      },
      {
        "description": "Menu item label",
        "id": "jvo0vs",
        "message": "Save",
        "reference": {
          "column": 11,
          "line": 8,
          "path": "test.tsx",
        },
      },
    ]
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

describe('syntax per file extension', () => {
  const typeScriptOnly = `
    import {useExtracted} from 'next-intl';

    const identity = <T,>(value: T) => value;
    const cast = <string>identity('x');

    function getMessage() {
      const t = useExtracted();
      return t('Hello!') + cast;
    }
  `;

  const jsx = `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      return <p>{t('Hello!')}</p>;
    }
  `;

  it.each(['ts', 'mts', 'cts'])(
    'parses type assertions in .%s files',
    async (extension) => {
      const result = await new MessageExtractor({
        projectRoot: '/project'
      }).extract(`/project/test.${extension}`, typeScriptOnly);
      expect(result.map((message) => message.message)).toEqual(['Hello!']);
    }
  );

  it.each(['tsx', 'js', 'jsx', 'mjs', 'cjs'])(
    'parses JSX in .%s files',
    async (extension) => {
      const result = await new MessageExtractor({
        projectRoot: '/project'
      }).extract(`/project/test.${extension}`, jsx);
      expect(result.map((message) => message.message)).toEqual(['Hello!']);
    }
  );
});

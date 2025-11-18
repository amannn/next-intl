import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {warn} from '../../plugin/utils.js';
import MessageExtractor from './MessageExtractor.js';

vi.mock('../../plugin/utils.js', () => ({
  warn: vi.fn(),
  throwError: vi.fn((message: string) => {
    throw new Error(message);
  })
}));

async function process(code: string) {
  const result = await new MessageExtractor({
    isDevelopment: true,
    projectRoot: '/project'
  }).processFileContent('/project/test.tsx', code);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {map, ...rest} = result;
  return rest;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('integration', () => {
  it('can extract messages from an event handler and JSX', async () => {
    expect(
      await process(
        `
    import {useState} from 'react';
    import {useExtracted} from 'next-intl';

    function Component() {
      const [notification, setNotification] = useState();
      const t = useExtracted();

      function onClick() {
        setNotification(t("Successfully sent!"));
      }

      return (
        <div>
          <button onClick={onClick}>
            {t("Send")}
          </button>
          {notification}
        </div>
      );
    }
  `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { useState } from 'react';
    import { useTranslations } from 'next-intl';
    function Component() {
        const [notification, setNotification] = useState();
        const t = useTranslations();
        function onClick() {
            setNotification(t("+1F2If", void 0, void 0, "Successfully sent!"));
        }
        return (<div>
              <button onClick={onClick}>
                {t("9WRlF4", void 0, void 0, "Send")}
              </button>
              {notification}
            </div>);
    }
    ",
        "messages": [
          {
            "description": null,
            "id": "+1F2If",
            "message": "Successfully sent!",
            "references": [
              {
                "path": "test.tsx",
              },
            ],
          },
          {
            "description": null,
            "id": "9WRlF4",
            "message": "Send",
            "references": [
              {
                "path": "test.tsx",
              },
            ],
          },
        ],
      }
    `);
  });

  it('supports t.rich', async () => {
    expect(
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t.rich('Hello <b>Alice</b>!', {b: (chunks) => <b>{chunks}</b>});
    }
    `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        t.rich("C+nN8a", {
            b: (chunks)=><b>{chunks}</b>
        }, void 0, "Hello <b>Alice</b>!");
    }
    ",
        "messages": [
          {
            "description": null,
            "id": "C+nN8a",
            "message": "Hello <b>Alice</b>!",
            "references": [
              {
                "path": "test.tsx",
              },
            ],
          },
        ],
      }
    `);
  });

  it('supports t.markup', async () => {
    expect(
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t.markup('Hello <b>Alice</b>!', {b: (chunks) => \`<b>\${chunks}</b>\`});
    }
    `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        t.markup("C+nN8a", {
            b: (chunks)=>\`<b>\${chunks}</b>\`
        }, void 0, "Hello <b>Alice</b>!");
    }
    ",
        "messages": [
          {
            "description": null,
            "id": "C+nN8a",
            "message": "Hello <b>Alice</b>!",
            "references": [
              {
                "path": "test.tsx",
              },
            ],
          },
        ],
      }
    `);
  });
});

describe('error handling', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    expect(warn).toHaveBeenCalledTimes(0);
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

describe('object syntax', () => {
  afterEach(() => {
    expect(warn).not.toHaveBeenCalled();
  });

  it('can extract description from object syntax', async () => {
    expect(
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t({
        message: 'Right',
        description: 'Advance to the next slide'
      });
    }
  `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        t("gAnLDP", void 0, void 0, "Right");
    }
    ",
        "messages": [
          {
            "description": "Advance to the next slide",
            "id": "gAnLDP",
            "message": "Right",
            "references": [
              {
                "path": "test.tsx",
              },
            ],
          },
        ],
      }
    `);
  });

  it('can extract a description with an explicit id from object syntax', async () => {
    expect(
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t({
        id: 'next-slide',
        message: 'Right',
        description: 'Advance to the next slide'
      });
    }
  `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        t("next-slide", void 0, void 0, "Right");
    }
    ",
        "messages": [
          {
            "description": "Advance to the next slide",
            "id": "next-slide",
            "message": "Right",
            "references": [
              {
                "path": "test.tsx",
              },
            ],
          },
        ],
      }
    `);
  });

  it('can extract a description with values from object syntax', async () => {
    expect(
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t({
        message: 'Hello {name}!',
        description: 'Greeting message with name placeholder',
        values: {name: 'Alice'}
      });
    }
  `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        t("wafoOY", {
            name: 'Alice'
        }, void 0, "Hello {name}!");
    }
    ",
        "messages": [
          {
            "description": "Greeting message with name placeholder",
            "id": "wafoOY",
            "message": "Hello {name}!",
            "references": [
              {
                "path": "test.tsx",
              },
            ],
          },
        ],
      }
    `);
  });

  it('can extract a description with a template literal from object syntax', async () => {
    expect(
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t({
        message: \`Right\`,
        description: \`Advance to the next slide\`
      });
    }
  `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        t("gAnLDP", void 0, void 0, "Right");
    }
    ",
        "messages": [
          {
            "description": "Advance to the next slide",
            "id": "gAnLDP",
            "message": "Right",
            "references": [
              {
                "path": "test.tsx",
              },
            ],
          },
        ],
      }
    `);
  });

  it('throws for dynamic description expressions', async () => {
    await expect(async () => {
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      const desc = 'Dynamic description';
      t({
        message: 'Right',
        description: desc
      });
    }
  `
      );
    }).rejects.toThrow(
      'Cannot extract message from dynamic expression, messages need to be statically analyzable. If you need to provide runtime values, pass them as a separate argument.'
    );
  });
});

describe('getExtracted', () => {
  it('supports the object syntax for passing a locale and namespace', async () => {
    expect(
      await process(
        `
      import {getExtracted} from 'next-intl/server';

      async function Component() {
        const t = await getExtracted({locale: 'en', namespace: 'ui'});
        t("Hello there!");
      }
      `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { getTranslations } from 'next-intl/server';
      async function Component() {
          const t = await getTranslations({
              locale: 'en',
              namespace: 'ui'
          });
          t("0KGiQf", void 0, void 0, "Hello there!");
      }
      ",
        "messages": [
          {
            "description": null,
            "id": "ui.0KGiQf",
            "message": "Hello there!",
            "references": [
              {
                "path": "test.tsx",
              },
            ],
          },
        ],
      }
    `);
  });

});

it('does not add a fallback message in production', async () => {
  const result = await new MessageExtractor({
    isDevelopment: false,
    projectRoot: '/project'
  }).processFileContent(
    '/project/test.tsx',
    `import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t("Hey!");
    }
  `
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {map, ...rest} = result;
  expect(rest).toMatchInlineSnapshot(`
    {
      "code": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        t("+YJVTi");
    }
    ",
      "messages": [
        {
          "description": null,
          "id": "+YJVTi",
          "message": "Hey!",
          "references": [
            {
              "path": "test.tsx",
            },
          ],
        },
      ],
    }
  `);
});

describe('source maps', () => {
  it('can extract with source maps', async () => {
    const result = await new MessageExtractor({
      isDevelopment: true,
      projectRoot: '/project',
      sourceMap: true
    }).processFileContent(
      '/project/test.tsx',
      `import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t("Hello!");
    }
  `
    );

    expect(result.map).toMatchInlineSnapshot(
      `"{"version":3,"sources":["test.tsx"],"sourcesContent":["import {useExtracted} from 'next-intl';\\n\\n    function Component() {\\n      const t = useExtracted();\\n      t(\\"Hello!\\");\\n    }\\n  "],"names":["useExtracted","Component","t"],"mappings":"AAAA,SAAQA,eAAY,QAAO,YAAY;AAEnC,SAASC;IACP,MAAMC,IAAIF;IACVE,EAAE;AACJ"}"`
    );

    expect(result.map).not.toContain('<anon>');
  });
});

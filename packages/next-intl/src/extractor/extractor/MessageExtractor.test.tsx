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

it('can extract a simple message', async () => {
  expect(
    await process(
      `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t("Hey!");
    }
  `
    )
  ).toMatchInlineSnapshot(`
    {
      "code": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        t("+YJVTi", void 0, void 0, "Hey!");
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

it('can extract a message with a let variable', async () => {
  expect(
    await process(
      `
    import {useExtracted} from 'next-intl';

    function Component() {
      let t = useExtracted();
      t("Hey!");
    }
  `
    )
  ).toMatchInlineSnapshot(`
    {
      "code": "import { useTranslations } from 'next-intl';
    function Component() {
        let t = useTranslations();
        t("+YJVTi", void 0, void 0, "Hey!");
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

it('can extract a message with a renamed variable', async () => {
  expect(
    await process(
      `
    import {useExtracted} from 'next-intl';

    function Component() {
      const translate = useExtracted();
      translate("Hello!");
    }
  `
    )
  ).toMatchInlineSnapshot(`
    {
      "code": "import { useTranslations } from 'next-intl';
    function Component() {
        const translate = useTranslations();
        translate("OpKKos", void 0, void 0, "Hello!");
    }
    ",
      "messages": [
        {
          "description": null,
          "id": "OpKKos",
          "message": "Hello!",
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

it('can extract a message with different quotes', async () => {
  expect(
    await process(
      `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t("Hello!");
      t('Hey!');
      t(\`Hi!\`);
    }
  `
    )
  ).toMatchInlineSnapshot(`
    {
      "code": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        t("OpKKos", void 0, void 0, "Hello!");
        t("+YJVTi", void 0, void 0, "Hey!");
        t("nm/7yQ", void 0, void 0, "Hi!");
    }
    ",
      "messages": [
        {
          "description": null,
          "id": "OpKKos",
          "message": "Hello!",
          "references": [
            {
              "path": "test.tsx",
            },
          ],
        },
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
        {
          "description": null,
          "id": "nm/7yQ",
          "message": "Hi!",
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

it('can extract a message with useTranslations already present', async () => {
  expect(
    await process(
      `
    import {useExtracted, useTranslations} from 'next-intl';

    function Component() {
      const t = useExtracted();
      const t2 = useTranslations();
      t("Hello from extracted!");
      t2("greeting");
    }
  `
    )
  ).toMatchInlineSnapshot(`
    {
      "code": "import { useTranslations, useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        const t2 = useTranslations();
        t("piskIR", void 0, void 0, "Hello from extracted!");
        t2("greeting");
    }
    ",
      "messages": [
        {
          "description": null,
          "id": "piskIR",
          "message": "Hello from extracted!",
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

it('can extract a message with t out of scope', async () => {
  expect(
    await process(
      `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t("Hey!");
    }

    const t = (msg) => msg;
    t("Should not be transformed");
  `
    )
  ).toMatchInlineSnapshot(`
    {
      "code": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        t("+YJVTi", void 0, void 0, "Hey!");
    }
    const t = (msg)=>msg;
    t("Should not be transformed");
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

it('can extract a message with a renamed hook', async () => {
  expect(
    await process(
      `
    import {useExtracted as useInlined} from 'next-intl';

    function Component() {
      const t = useInlined();
      t("Hey!");
    }
  `
    )
  ).toMatchInlineSnapshot(`
    {
      "code": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        t("+YJVTi", void 0, void 0, "Hey!");
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

it('supports passing values', async () => {
  expect(
    await process(
      `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t('Hello, {name}!', {name: 'Alice'});
    }
    `
    )
  ).toMatchInlineSnapshot(`
    {
      "code": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        t("tBFOH1", {
            name: 'Alice'
        }, void 0, "Hello, {name}!");
    }
    ",
      "messages": [
        {
          "description": null,
          "id": "tBFOH1",
          "message": "Hello, {name}!",
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

it('supports passing an inline date formatter', async () => {
  expect(
    await process(
      `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t('{date, date, short}!', {date: new Date()}, {short: {dateStyle: 'short'}});
    }
  `
    )
  ).toMatchInlineSnapshot(`
    {
      "code": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        t("5n+ZPU", {
            date: new Date()
        }, {
            short: {
                dateStyle: 'short'
            }
        }, "{date, date, short}!");
    }
    ",
      "messages": [
        {
          "description": null,
          "id": "5n+ZPU",
          "message": "{date, date, short}!",
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

it('supports t.has', async () => {
  expect(
    await process(
      `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t.has('Hello there!');
    }
    `
    )
  ).toMatchInlineSnapshot(`
    {
      "code": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        t.has("0KGiQf");
    }
    ",
      "messages": [
        {
          "description": null,
          "id": "0KGiQf",
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

it('can extract with a namespace', async () => {
  expect(
    await process(
      `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted('ui');
      t('Hello!');
    }
          `
    )
  ).toMatchInlineSnapshot(`
    {
      "code": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations('ui');
        t("OpKKos", void 0, void 0, "Hello!");
    }
    ",
      "messages": [
        {
          "description": null,
          "id": "ui.OpKKos",
          "message": "Hello!",
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

  it('can extract with an explicit id and single quotes', async () => {
    expect(
      await process(
        `
      import {useExtracted} from 'next-intl';
  
      function Component() {
        const t = useExtracted();
        t({id: 'greeting', message: 'Hello!'});
      }
      `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslations } from 'next-intl';
      function Component() {
          const t = useTranslations();
          t("greeting", void 0, void 0, "Hello!");
      }
      ",
        "messages": [
          {
            "description": null,
            "id": "greeting",
            "message": "Hello!",
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

  it('can extract with an explicit id and double quotes', async () => {
    expect(
      await process(
        `
      import {useExtracted} from 'next-intl';
  
      function Component() {
        const t = useExtracted();
        t({id: "greeting", message: "Hello!"});
      }
      `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslations } from 'next-intl';
      function Component() {
          const t = useTranslations();
          t("greeting", void 0, void 0, "Hello!");
      }
      ",
        "messages": [
          {
            "description": null,
            "id": "greeting",
            "message": "Hello!",
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

  it('can extract with an explicit id and a template literal', async () => {
    expect(
      await process(
        `
      import {useExtracted} from 'next-intl';
  
      function Component() {
        const t = useExtracted();
        t({id: \`greeting\`, message: \`Hello!\`});
      }
      `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslations } from 'next-intl';
      function Component() {
          const t = useTranslations();
          t("greeting", void 0, void 0, "Hello!");
      }
      ",
        "messages": [
          {
            "description": null,
            "id": "greeting",
            "message": "Hello!",
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

  it('can extract with an explicit id and values', async () => {
    expect(
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t({id: "greeting", message: 'Hello!', values: {name: 'Alice'}});
    }
    `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslations } from 'next-intl';
      function Component() {
          const t = useTranslations();
          t("greeting", {
              name: 'Alice'
          }, void 0, "Hello!");
      }
      ",
        "messages": [
          {
            "description": null,
            "id": "greeting",
            "message": "Hello!",
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

  it('can extract with an explicit id, values and formats', async () => {
    expect(
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t({
        id: "greeting",
        message: 'Hello!',
        values: {name: 'Alice'},
        formats: {date: {dateStyle: 'short'}}
      });
    }
          `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslations } from 'next-intl';
      function Component() {
          const t = useTranslations();
          t("greeting", {
              name: 'Alice'
          }, {
              date: {
                  dateStyle: 'short'
              }
          }, "Hello!");
      }
      ",
        "messages": [
          {
            "description": null,
            "id": "greeting",
            "message": "Hello!",
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

  it('can extract with an explicit id when using t.rich', async () => {
    expect(
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t.rich({
        id: 'greeting',
        message: 'Hello <b>Alice</b>!',
        values: {b: (chunks) => <b>{chunks}</b>}
      });
    }
          `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslations } from 'next-intl';
      function Component() {
          const t = useTranslations();
          t.rich("greeting", {
              b: (chunks)=><b>{chunks}</b>
          }, void 0, "Hello <b>Alice</b>!");
      }
      ",
        "messages": [
          {
            "description": null,
            "id": "greeting",
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

  it('can extract with an explicit id when using t.markup', async () => {
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

  it('can extracth with an explicit id and a namespace', async () => {
    expect(
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted('ui');
      t({id: 'greeting', message: 'Hello!'});
    }
          `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { useTranslations } from 'next-intl';
      function Component() {
          const t = useTranslations('ui');
          t("greeting", void 0, void 0, "Hello!");
      }
      ",
        "messages": [
          {
            "description": null,
            "id": "ui.greeting",
            "message": "Hello!",
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

describe('getExtracted', () => {
  it('supports plain messages', async () => {
    expect(
      await process(
        `
      import {getExtracted} from 'next-intl/server';

      async function Component() {
        const t = await getExtracted();
        t("Hello there!");
      }
      `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { getTranslations } from 'next-intl/server';
      async function Component() {
          const t = await getTranslations();
          t("0KGiQf", void 0, void 0, "Hello there!");
      }
      ",
        "messages": [
          {
            "description": null,
            "id": "0KGiQf",
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

  it('can extract a message with a renamed variable', async () => {
    expect(
      await process(
        `
    import {getExtracted} from 'next-intl/server';

    async function Component() {
      const translate = await getExtracted();
      translate("Hello there!");
    }
    `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { getTranslations } from 'next-intl/server';
      async function Component() {
          const translate = await getTranslations();
          translate("0KGiQf", void 0, void 0, "Hello there!");
      }
      ",
        "messages": [
          {
            "description": null,
            "id": "0KGiQf",
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

  it('supports the object syntax for passing a locale', async () => {
    expect(
      await process(
        `
      import {getExtracted} from 'next-intl/server';

      async function Component() {
        const t = await getExtracted({locale: 'en'});
        t("Hello there!");
      }
      `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { getTranslations } from 'next-intl/server';
      async function Component() {
          const t = await getTranslations({
              locale: 'en'
          });
          t("0KGiQf", void 0, void 0, "Hello there!");
      }
      ",
        "messages": [
          {
            "description": null,
            "id": "0KGiQf",
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

  it('supports the object syntax for passing an explicit id', async () => {
    expect(
      await process(
        `
    import {getExtracted} from 'next-intl/server';

    async function Component() {
      const t = await getExtracted();
      t({
        id: 'greeting',
        message: 'Hello {name}!',
        values: {name: 'Alice'}
      });
    }
          `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { getTranslations } from 'next-intl/server';
      async function Component() {
          const t = await getTranslations();
          t("greeting", {
              name: 'Alice'
          }, void 0, "Hello {name}!");
      }
      ",
        "messages": [
          {
            "description": null,
            "id": "greeting",
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

  it('can extract with a namespace', async () => {
    expect(
      await process(
        `
    import {getExtracted} from 'next-intl/server';

    async function Component() {
      const t = await getExtracted('ui');
      t("Hello!");
    }
          `
      )
    ).toMatchInlineSnapshot(`
      {
        "code": "import { getTranslations } from 'next-intl/server';
      async function Component() {
          const t = await getTranslations('ui');
          t("OpKKos", void 0, void 0, "Hello!");
      }
      ",
        "messages": [
          {
            "description": null,
            "id": "ui.OpKKos",
            "message": "Hello!",
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

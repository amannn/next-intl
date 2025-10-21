import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {warn} from '../../utils.js';
import MessageExtractor from './MessageExtractor.js';

vi.mock('../../utils.js', () => ({
  warn: vi.fn(),
  throwError: vi.fn((message: string) => {
    throw new Error(message);
  })
}));

async function process(code: string) {
  return await new MessageExtractor(true).processFileContent('test.tsx', code);
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
      "messages": [
        {
          "filePath": "test.tsx",
          "id": "+YJVTi",
          "message": "Hey!",
        },
      ],
      "source": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        t("+YJVTi", undefined, undefined, "Hey!");
    }
    ",
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
      "messages": [
        {
          "filePath": "test.tsx",
          "id": "+YJVTi",
          "message": "Hey!",
        },
      ],
      "source": "import { useTranslations } from 'next-intl';
    function Component() {
        let t = useTranslations();
        t("+YJVTi", undefined, undefined, "Hey!");
    }
    ",
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
      "messages": [
        {
          "filePath": "test.tsx",
          "id": "OpKKos",
          "message": "Hello!",
        },
      ],
      "source": "import { useTranslations } from 'next-intl';
    function Component() {
        const translate = useTranslations();
        translate("OpKKos", undefined, undefined, "Hello!");
    }
    ",
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
        "messages": [
          {
            "filePath": "test.tsx",
            "id": "OpKKos",
            "message": "Hello!",
          },
          {
            "filePath": "test.tsx",
            "id": "+YJVTi",
            "message": "Hey!",
          },
          {
            "filePath": "test.tsx",
            "id": "nm/7yQ",
            "message": "Hi!",
          },
        ],
        "source": "import { useTranslations } from 'next-intl';
      function Component() {
          const t = useTranslations();
          t("OpKKos", undefined, undefined, "Hello!");
          t("+YJVTi", undefined, undefined, "Hey!");
          t("nm/7yQ", undefined, undefined, "Hi!");
      }
      ",
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
      "messages": [
        {
          "filePath": "test.tsx",
          "id": "piskIR",
          "message": "Hello from extracted!",
        },
      ],
      "source": "import { useTranslations, useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        const t2 = useTranslations();
        t("piskIR", undefined, undefined, "Hello from extracted!");
        t2("greeting");
    }
    ",
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
      "messages": [
        {
          "filePath": "test.tsx",
          "id": "+YJVTi",
          "message": "Hey!",
        },
      ],
      "source": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        t("+YJVTi", undefined, undefined, "Hey!");
    }
    const t = (msg)=>msg;
    t("Should not be transformed");
    ",
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
      "messages": [
        {
          "filePath": "test.tsx",
          "id": "+1F2If",
          "message": "Successfully sent!",
        },
        {
          "filePath": "test.tsx",
          "id": "9WRlF4",
          "message": "Send",
        },
      ],
      "source": "import { useState } from 'react';
    import { useTranslations } from 'next-intl';
    function Component() {
        const [notification, setNotification] = useState();
        const t = useTranslations();
        function onClick() {
            setNotification(t("+1F2If", undefined, undefined, "Successfully sent!"));
        }
        return (<div>
              <button onClick={onClick}>
                {t("9WRlF4", undefined, undefined, "Send")}
              </button>
              {notification}
            </div>);
    }
    ",
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
      "messages": [
        {
          "filePath": "test.tsx",
          "id": "+YJVTi",
          "message": "Hey!",
        },
      ],
      "source": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        t("+YJVTi", undefined, undefined, "Hey!");
    }
    ",
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
      "messages": [
        {
          "filePath": "test.tsx",
          "id": "tBFOH1",
          "message": "Hello, {name}!",
        },
      ],
      "source": "import { useTranslations } from 'next-intl';
    function Component() {
        const t = useTranslations();
        t("tBFOH1", {
            name: 'Alice'
        }, undefined, "Hello, {name}!");
    }
    ",
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
      "messages": [
        {
          "filePath": "test.tsx",
          "id": "5n+ZPU",
          "message": "{date, date, short}!",
        },
      ],
      "source": "import { useTranslations } from 'next-intl';
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
        "messages": [
          {
            "filePath": "test.tsx",
            "id": "C+nN8a",
            "message": "Hello <b>Alice</b>!",
          },
        ],
        "source": "import { useTranslations } from 'next-intl';
      function Component() {
          const t = useTranslations();
          t.rich("C+nN8a", {
              b: (chunks)=><b>{chunks}</b>
          }, undefined, "Hello <b>Alice</b>!");
      }
      ",
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
        "messages": [
          {
            "filePath": "test.tsx",
            "id": "C+nN8a",
            "message": "Hello <b>Alice</b>!",
          },
        ],
        "source": "import { useTranslations } from 'next-intl';
      function Component() {
          const t = useTranslations();
          t.markup("C+nN8a", {
              b: (chunks)=>\`<b>\${chunks}</b>\`
          }, undefined, "Hello <b>Alice</b>!");
      }
      ",
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
        "messages": [
          {
            "filePath": "test.tsx",
            "id": "0KGiQf",
            "message": "Hello there!",
          },
        ],
        "source": "import { useTranslations } from 'next-intl';
      function Component() {
          const t = useTranslations();
          t.has("0KGiQf");
      }
      ",
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
          "messages": [
            {
              "filePath": "test.tsx",
              "id": "ui.OpKKos",
              "message": "Hello!",
            },
          ],
          "source": "import { useTranslations } from 'next-intl';
        function Component() {
            const t = useTranslations('ui');
            t("OpKKos", undefined, undefined, "Hello!");
        }
        ",
        }
      `);
});

describe('error handling', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    expect(warn).toHaveBeenCalledTimes(0);
  });

  it('warns when using a template literal with interpolation', async () => {
    expect(
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      const name = 'Alice';
      t(\`Hello \${name}!\`);
    }
    `
      )
    ).toMatchInlineSnapshot(`
        {
          "messages": [],
          "source": "import { useTranslations } from 'next-intl';
        function Component() {
            const t = useTranslations();
            const name = 'Alice';
            t(\`Hello \${name}!\`);
        }
        ",
        }
      `);

    // Note: We still transform to `useTranslations`, so that other potential
    // calls to `useExtracted` remain not affected. The user should
    // additionally see a warning on the console, which hints at something
    // being wrong. There's a theoretical risk of us matching a valid ID, but
    // since we can't extract in the first place, this message shouldn't be
    // present in the catalog.

    expect(warn).toHaveBeenCalledWith(
      'test.tsx: Cannot extract message from dynamic expression, messages need to be statically analyzable. If you need to provide runtime values, pass them as a separate argument.'
    );
  });

  it('warns when using string concatenation with +', async () => {
    expect(
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      const name = 'Alice';
      t('Hello ' + name + '!');
    }
    `
      )
    ).toMatchInlineSnapshot(`
        {
          "messages": [],
          "source": "import { useTranslations } from 'next-intl';
        function Component() {
            const t = useTranslations();
            const name = 'Alice';
            t('Hello ' + name + '!');
        }
        ",
        }
      `);
    expect(warn).toHaveBeenCalledWith(
      'test.tsx: Cannot extract message from dynamic expression, messages need to be statically analyzable. If you need to provide runtime values, pass them as a separate argument.'
    );
  });

  it('warns when using a ternary expression', async () => {
    expect(
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component({isAdmin}) {
      const t = useExtracted();
      t(isAdmin ? 'Admin panel' : 'User panel');
    }
    `
      )
    ).toMatchInlineSnapshot(`
        {
          "messages": [],
          "source": "import { useTranslations } from 'next-intl';
        function Component({ isAdmin }) {
            const t = useTranslations();
            t(isAdmin ? 'Admin panel' : 'User panel');
        }
        ",
        }
      `);
    expect(warn).toHaveBeenCalledWith(
      'test.tsx: Cannot extract message from dynamic expression, messages need to be statically analyzable. If you need to provide runtime values, pass them as a separate argument.'
    );
  });

  it('warns when using a variable reference', async () => {
    expect(
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      const message = 'Hello world';
      t(message);
    }
    `
      )
    ).toMatchInlineSnapshot(`
        {
          "messages": [],
          "source": "import { useTranslations } from 'next-intl';
        function Component() {
            const t = useTranslations();
            const message = 'Hello world';
            t(message);
        }
        ",
        }
      `);
    expect(warn).toHaveBeenCalledWith(
      'test.tsx: Cannot extract message from dynamic expression, messages need to be statically analyzable. If you need to provide runtime values, pass them as a separate argument.'
    );
  });

  it('warns when using a function call', async () => {
    expect(
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t(getMessage());
    }
    `
      )
    ).toMatchInlineSnapshot(`
        {
          "messages": [],
          "source": "import { useTranslations } from 'next-intl';
        function Component() {
            const t = useTranslations();
            t(getMessage());
        }
        ",
        }
      `);
    expect(warn).toHaveBeenCalledWith(
      'test.tsx: Cannot extract message from dynamic expression, messages need to be statically analyzable. If you need to provide runtime values, pass them as a separate argument.'
    );
  });

  it('warns when using a dynamic expression with object syntax', async () => {
    expect(
      await process(
        `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t({id: 'test', message: getMessage()});
    }
    `
      )
    ).toMatchInlineSnapshot(`
        {
          "messages": [],
          "source": "import { useTranslations } from 'next-intl';
        function Component() {
            const t = useTranslations();
            t({
                id: 'test',
                message: getMessage()
            });
        }
        ",
        }
      `);
    expect(warn).toHaveBeenCalledWith(
      'test.tsx: Cannot extract message from dynamic expression, messages need to be statically analyzable. If you need to provide runtime values, pass them as a separate argument.'
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
          "messages": [
            {
              "filePath": "test.tsx",
              "id": "greeting",
              "message": "Hello!",
            },
          ],
          "source": "import { useTranslations } from 'next-intl';
        function Component() {
            const t = useTranslations();
            t("greeting", undefined, undefined, "Hello!");
        }
        ",
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
          "messages": [
            {
              "filePath": "test.tsx",
              "id": "greeting",
              "message": "Hello!",
            },
          ],
          "source": "import { useTranslations } from 'next-intl';
        function Component() {
            const t = useTranslations();
            t("greeting", undefined, undefined, "Hello!");
        }
        ",
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
          "messages": [
            {
              "filePath": "test.tsx",
              "id": "greeting",
              "message": "Hello!",
            },
          ],
          "source": "import { useTranslations } from 'next-intl';
        function Component() {
            const t = useTranslations();
            t("greeting", undefined, undefined, "Hello!");
        }
        ",
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
          "messages": [
            {
              "filePath": "test.tsx",
              "id": "greeting",
              "message": "Hello!",
            },
          ],
          "source": "import { useTranslations } from 'next-intl';
        function Component() {
            const t = useTranslations();
            t("greeting", {
                name: 'Alice'
            }, undefined, "Hello!");
        }
        ",
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
          "messages": [
            {
              "filePath": "test.tsx",
              "id": "greeting",
              "message": "Hello!",
            },
          ],
          "source": "import { useTranslations } from 'next-intl';
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
          "messages": [
            {
              "filePath": "test.tsx",
              "id": "greeting",
              "message": "Hello <b>Alice</b>!",
            },
          ],
          "source": "import { useTranslations } from 'next-intl';
        function Component() {
            const t = useTranslations();
            t.rich("greeting", {
                b: (chunks)=><b>{chunks}</b>
            }, undefined, "Hello <b>Alice</b>!");
        }
        ",
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
          "messages": [
            {
              "filePath": "test.tsx",
              "id": "C+nN8a",
              "message": "Hello <b>Alice</b>!",
            },
          ],
          "source": "import { useTranslations } from 'next-intl';
        function Component() {
            const t = useTranslations();
            t.markup("C+nN8a", {
                b: (chunks)=>\`<b>\${chunks}</b>\`
            }, undefined, "Hello <b>Alice</b>!");
        }
        ",
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
          "messages": [
            {
              "filePath": "test.tsx",
              "id": "ui.greeting",
              "message": "Hello!",
            },
          ],
          "source": "import { useTranslations } from 'next-intl';
        function Component() {
            const t = useTranslations('ui');
            t("greeting", undefined, undefined, "Hello!");
        }
        ",
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
          "messages": [
            {
              "filePath": "test.tsx",
              "id": "0KGiQf",
              "message": "Hello there!",
            },
          ],
          "source": "import { getTranslations } from 'next-intl/server';
        async function Component() {
            const t = await getTranslations();
            t("0KGiQf", undefined, undefined, "Hello there!");
        }
        ",
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
          "messages": [
            {
              "filePath": "test.tsx",
              "id": "0KGiQf",
              "message": "Hello there!",
            },
          ],
          "source": "import { getTranslations } from 'next-intl/server';
        async function Component() {
            const translate = await getTranslations();
            translate("0KGiQf", undefined, undefined, "Hello there!");
        }
        ",
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
          "messages": [
            {
              "filePath": "test.tsx",
              "id": "0KGiQf",
              "message": "Hello there!",
            },
          ],
          "source": "import { getTranslations } from 'next-intl/server';
        async function Component() {
            const t = await getTranslations({
                locale: 'en'
            });
            t("0KGiQf", undefined, undefined, "Hello there!");
        }
        ",
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
          "messages": [
            {
              "filePath": "test.tsx",
              "id": "0KGiQf",
              "message": "Hello there!",
            },
          ],
          "source": "import { getTranslations } from 'next-intl/server';
        async function Component() {
            const t = await getTranslations({
                locale: 'en',
                namespace: 'ui'
            });
            t("0KGiQf", undefined, undefined, "Hello there!");
        }
        ",
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
          "messages": [
            {
              "filePath": "test.tsx",
              "id": "greeting",
              "message": "Hello {name}!",
            },
          ],
          "source": "import { getTranslations } from 'next-intl/server';
        async function Component() {
            const t = await getTranslations();
            t("greeting", {
                name: 'Alice'
            }, undefined, "Hello {name}!");
        }
        ",
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
          "messages": [
            {
              "filePath": "test.tsx",
              "id": "ui.OpKKos",
              "message": "Hello!",
            },
          ],
          "source": "import { getTranslations } from 'next-intl/server';
        async function Component() {
            const t = await getTranslations('ui');
            t("OpKKos", undefined, undefined, "Hello!");
        }
        ",
        }
      `);
  });
});

it('does not add a fallback message in production', async () => {
  expect(
    await new MessageExtractor(false).processFileContent(
      'test.tsx',
      `import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t("Hey!");
    }
  `
    )
  ).toMatchInlineSnapshot(`
      {
        "messages": [
          {
            "filePath": "test.tsx",
            "id": "+YJVTi",
            "message": "Hey!",
          },
        ],
        "source": "import { useTranslations } from 'next-intl';
      function Component() {
          const t = useTranslations();
          t("+YJVTi");
      }
      ",
      }
    `);
});

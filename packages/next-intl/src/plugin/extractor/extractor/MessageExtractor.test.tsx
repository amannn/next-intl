import {describe, expect, it} from 'vitest';
import MessageExtractor from './MessageExtractor.js';

describe('development', () => {
  async function process(code: string) {
    return await new MessageExtractor(true).processFileContent(
      'test.tsx',
      code
    );
  }

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
});

describe('production', () => {
  it('does not add fallback message', async () => {
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
});

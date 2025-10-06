import {expect, it} from 'vitest';
import type {ExtractedMessage} from '../types.js';
import MessageExtractor from './MessageExtractor.js';

function expectSourceToMatch(code: string, expected: string) {
  function normalize(snippet: string) {
    return snippet
      .replace(/\s+/g, ' ')
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*\(\s*/g, '(')
      .replace(/\s*\)\s*/g, ')')
      .replace(/\s*\[\s*/g, '[')
      .replace(/\s*\]\s*/g, ']')
      .replace(/\s*;\s*/g, ';')
      .replace(/\s*,\s*/g, ',')
      .replace(/\s*=\s*/g, '=')
      .replace(/\s*=>\s*/g, '=>')
      .replace(/\{\s+/g, '{')
      .replace(/\s+\}/g, '}')
      .trim();
  }
  expect(normalize(code)).toBe(normalize(expected));
}

async function expectExtractionToMatch(
  code: string,
  compiled: string,
  messages: Array<ExtractedMessage>
) {
  const result = await new MessageExtractor().processFileContent(
    'test.tsx',
    code
  );
  expectSourceToMatch(result.source, compiled);
  expect(result.messages).toEqual(messages);
}

it('can extract a simple message', async () => {
  await expectExtractionToMatch(
    `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t("Hey!");
    }
  `,
    `
    import {useTranslations} from 'next-intl';

    function Component() {
      const t = useTranslations();
      t("+YJVTi");
    }
  `,
    [
      {
        id: '+YJVTi',
        message: 'Hey!',
        filePath: 'test.tsx'
      }
    ]
  );
});

it('can extract a message with a let variable', async () => {
  await expectExtractionToMatch(
    `
    import {useExtracted} from 'next-intl';

    function Component() {
      let t = useExtracted();
      t("Hey!");
    }
  `,
    `
    import {useTranslations} from 'next-intl';

    function Component() {
      let t = useTranslations();
      t("+YJVTi");
    }
  `,
    [
      {
        id: '+YJVTi',
        message: 'Hey!',
        filePath: 'test.tsx'
      }
    ]
  );
});

it('can extract a message with a renamed variable', async () => {
  await expectExtractionToMatch(
    `
    import {useExtracted} from 'next-intl';

    function Component() {
      const translate = useExtracted();
      translate("Hello!");
    }
  `,
    `
    import {useTranslations} from 'next-intl';

    function Component() {
      const translate = useTranslations();
      translate("OpKKos");
    }
  `,
    [
      {
        id: 'OpKKos',
        message: 'Hello!',
        filePath: 'test.tsx'
      }
    ]
  );
});

it('can extract a message with useTranslations already present', async () => {
  await expectExtractionToMatch(
    `
    import {useExtracted, useTranslations} from 'next-intl';

    function Component() {
      const t = useExtracted();
      const t2 = useTranslations();
      t("Hello from extracted!");
      t2("greeting");
    }
  `,
    `
    import {useTranslations, useTranslations} from 'next-intl';

    function Component() {
      const t = useTranslations();
      const t2 = useTranslations();
      t("piskIR");
      t2("greeting");
    }
  `,
    [
      {
        id: 'piskIR',
        message: 'Hello from extracted!',
        filePath: 'test.tsx'
      }
    ]
  );
});

it('can extract a message with t out of scope', async () => {
  await expectExtractionToMatch(
    `
    import {useExtracted} from 'next-intl';

    function Component() {
      const t = useExtracted();
      t("Hey!");
    }

    const t = (msg) => msg;
    t("Should not be transformed");
  `,
    `
    import {useTranslations} from 'next-intl';

    function Component() {
      const t = useTranslations();
      t("+YJVTi");
    }

    const t = (msg) => msg;
    t("Should not be transformed");
  `,
    [
      {
        id: '+YJVTi',
        message: 'Hey!',
        filePath: 'test.tsx'
      }
    ]
  );
});

it('can extract messages from an event handler and JSX', async () => {
  await expectExtractionToMatch(
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
  `,
    `
    import {useState} from 'react';
    import {useTranslations} from 'next-intl';

    function Component() {
      const [notification, setNotification] = useState();
      const t = useTranslations();

      function onClick() {
        setNotification(t("+1F2If"));
      }

      return (
        <div>
          <button onClick={onClick}>
            {t("9WRlF4")}
          </button>
          {notification}
        </div>
      );
    }
  `,
    [
      {
        id: '+1F2If',
        message: 'Successfully sent!',
        filePath: 'test.tsx'
      },
      {
        id: '9WRlF4',
        message: 'Send',
        filePath: 'test.tsx'
      }
    ]
  );
});

it('can extract a message with a renamed hook', async () => {
  await expectExtractionToMatch(
    `
    import {useExtracted as useInlined} from 'next-intl';

    function Component() {
      const t = useInlined();
      t("Hey!");
    }
  `,
    `
    import {useTranslations} from 'next-intl';

    function Component() {
      const t = useTranslations();
      t("+YJVTi");
    }
  `,
    [
      {
        id: '+YJVTi',
        message: 'Hey!',
        filePath: 'test.tsx'
      }
    ]
  );
});

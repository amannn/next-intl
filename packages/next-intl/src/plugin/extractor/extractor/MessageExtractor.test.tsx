import {expect, it} from 'vitest';
import MessageExtractor from './MessageExtractor.js';

function normalizeCode(code: string): string {
  return code
    .replace(/\s+/g, ' ')
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*\(\s*/g, '(')
    .replace(/\s*\)\s*/g, ')')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',')
    .replace(/\s*=\s*/g, '=')
    .replace(/\s*=>\s*/g, '=>')
    .trim();
}

it('can extract a simple message', async () => {
  const input = `import {useExtracted} from 'next-intl';

function Component() {
    const t = useExtracted();
    t("Hey!");
}`;

  const result = await new MessageExtractor().processFileContent(
    'test.tsx',
    input
  );

  const expected = `import { useTranslations } from 'next-intl';

function Component() {
    const t = useTranslations();
    t("+YJVTi");
}`;

  expect(normalizeCode(result.source)).toBe(normalizeCode(expected));
  expect(result.messages).toEqual([
    {
      id: '+YJVTi',
      message: 'Hey!',
      filePath: 'test.tsx'
    }
  ]);
});

it('can extract a message with a let variable', async () => {
  const input = `import {useExtracted} from 'next-intl';

function Component() {
    let t = useExtracted();
    t("Hey!");
}`;

  const result = await new MessageExtractor().processFileContent(
    'test.tsx',
    input
  );

  const expected = `import { useTranslations } from 'next-intl';

function Component() {
    let t = useTranslations();
    t("+YJVTi");
}`;

  expect(normalizeCode(result.source)).toBe(normalizeCode(expected));
  expect(result.messages).toEqual([
    {
      id: '+YJVTi',
      message: 'Hey!',
      filePath: 'test.tsx'
    }
  ]);
});

it('can extract a message with a renamed variable', async () => {
  const input = `import {useExtracted} from 'next-intl';

function Component() {
    const translate = useExtracted();
    translate("Hello!");
}`;

  const result = await new MessageExtractor().processFileContent(
    'test.tsx',
    input
  );

  const expected = `import { useTranslations } from 'next-intl';

function Component() {
    const translate = useTranslations();
    translate("OpKKos");
}`;

  expect(normalizeCode(result.source)).toBe(normalizeCode(expected));
  expect(result.messages).toEqual([
    {
      id: 'OpKKos',
      message: 'Hello!',
      filePath: 'test.tsx'
    }
  ]);
});

it('can extract a message with useTranslations already present', async () => {
  const input = `import {useExtracted, useTranslations} from 'next-intl';

function Component() {
    const t = useExtracted();
    const t2 = useTranslations();
    t("Hello from extracted!");
    t2("greeting");
}`;

  const result = await new MessageExtractor().processFileContent(
    'test.tsx',
    input
  );

  const expected = `import { useTranslations, useTranslations } from 'next-intl';

function Component() {
    const t = useTranslations();
    const t2 = useTranslations();
    t("piskIR");
    t2("greeting");
}`;

  expect(normalizeCode(result.source)).toBe(normalizeCode(expected));
  expect(result.messages).toEqual([
    {
      id: 'piskIR',
      message: 'Hello from extracted!',
      filePath: 'test.tsx'
    }
  ]);
});

it('can extract a message with t out of scope', async () => {
  const input = `import {useExtracted} from 'next-intl';

function Component() {
    const t = useExtracted();
    t("Hey!");
}

const t = (msg) => msg;
t("Should not be transformed");`;

  const result = await new MessageExtractor().processFileContent(
    'test.tsx',
    input
  );

  const expected = `import { useTranslations } from 'next-intl';

function Component() {
    const t = useTranslations();
    t("+YJVTi");
}

const t = (msg) => msg;
t("Should not be transformed");`;

  expect(normalizeCode(result.source)).toBe(normalizeCode(expected));
  expect(result.messages).toEqual([
    {
      id: '+YJVTi',
      message: 'Hey!',
      filePath: 'test.tsx'
    }
  ]);
});

it('can extract a real-world message', async () => {
  const input = `import {useState} from 'react';
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
}`;

  const result = await new MessageExtractor().processFileContent(
    'test.tsx',
    input
  );

  const expected = `import { useState } from 'react';
import { useTranslations } from 'next-intl';

function Component() {
    const [notification, setNotification] = useState();
    const t = useTranslations();

    function onClick() {
        setNotification(t("+1F2If"));
    }

    return (<div>
            <button onClick={onClick}>
                {t("9WRlF4")}
            </button>
            {notification}
        </div>);
}`;

  expect(normalizeCode(result.source)).toBe(normalizeCode(expected));
  expect(result.messages).toEqual([
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
  ]);
});

it('can extract a message with a renamed function', async () => {
  const input = `import {useExtracted as useInlined} from 'next-intl';

function Component() {
    const t = useInlined();
    t("Hey!");
}`;

  const result = await new MessageExtractor().processFileContent(
    'test.tsx',
    input
  );

  const expected = `import { useTranslations } from 'next-intl';

function Component() {
    const t = useTranslations();
    t("+YJVTi");
}`;

  expect(normalizeCode(result.source)).toBe(normalizeCode(expected));
  expect(result.messages).toEqual([
    {
      id: '+YJVTi',
      message: 'Hey!',
      filePath: 'test.tsx'
    }
  ]);
});

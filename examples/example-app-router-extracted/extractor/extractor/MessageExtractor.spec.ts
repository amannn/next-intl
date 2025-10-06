import {test, describe} from 'node:test';
import assert from 'node:assert';
import MessageExtractor from './MessageExtractor.ts';

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

// Test cases from traversal_test_transform.rs

describe('MessageExtractor', () => {
  test('simple', async () => {
    const input = `import {useExtracted} from 'next-intl';

function Component() {
    const t = useExtracted();
    t("Hey!");
}`;

    const result = await MessageExtractor.processFileContent('test.tsx', input);

    const expected = `import { useTranslations } from 'next-intl';

function Component() {
    const t = useTranslations();
    t("+YJVTi");
}`;

    assert.strictEqual(normalizeCode(result.source), normalizeCode(expected));
    assert.deepStrictEqual(result.messages, [
      {
        id: '+YJVTi',
        message: 'Hey!',
        filePath: 'test.tsx'
      }
    ]);
  });

  test('with_let', async () => {
    const input = `import {useExtracted} from 'next-intl';

function Component() {
    let t = useExtracted();
    t("Hey!");
}`;

    const result = await MessageExtractor.processFileContent('test.tsx', input);

    const expected = `import { useTranslations } from 'next-intl';

function Component() {
    let t = useTranslations();
    t("+YJVTi");
}`;

    assert.strictEqual(normalizeCode(result.source), normalizeCode(expected));
    assert.deepStrictEqual(result.messages, [
      {
        id: '+YJVTi',
        message: 'Hey!',
        filePath: 'test.tsx'
      }
    ]);
  });

  test('renamed_var', async () => {
    const input = `import {useExtracted} from 'next-intl';

function Component() {
    const translate = useExtracted();
    translate("Hello!");
}`;

    const result = await MessageExtractor.processFileContent('test.tsx', input);

    const expected = `import { useTranslations } from 'next-intl';

function Component() {
    const translate = useTranslations();
    translate("OpKKos");
}`;

    assert.strictEqual(normalizeCode(result.source), normalizeCode(expected));
    assert.deepStrictEqual(result.messages, [
      {
        id: 'OpKKos',
        message: 'Hello!',
        filePath: 'test.tsx'
      }
    ]);
  });

  test('use_translations_already_present', async () => {
    const input = `import {useExtracted, useTranslations} from 'next-intl';

function Component() {
    const t = useExtracted();
    const t2 = useTranslations();
    t("Hello from extracted!");
    t2("greeting");
}`;

    const result = await MessageExtractor.processFileContent('test.tsx', input);

    const expected = `import { useTranslations, useTranslations } from 'next-intl';

function Component() {
    const t = useTranslations();
    const t2 = useTranslations();
    t("piskIR");
    t2("greeting");
}`;

    assert.strictEqual(normalizeCode(result.source), normalizeCode(expected));
    assert.deepStrictEqual(result.messages, [
      {
        id: 'piskIR',
        message: 'Hello from extracted!',
        filePath: 'test.tsx'
      }
    ]);
  });

  test('t_out_of_scope', async () => {
    const input = `import {useExtracted} from 'next-intl';

function Component() {
    const t = useExtracted();
    t("Hey!");
}

const t = (msg) => msg;
t("Should not be transformed");`;

    const result = await MessageExtractor.processFileContent('test.tsx', input);

    const expected = `import { useTranslations } from 'next-intl';

function Component() {
    const t = useTranslations();
    t("+YJVTi");
}

const t = (msg) => msg;
t("Should not be transformed");`;

    assert.strictEqual(normalizeCode(result.source), normalizeCode(expected));
    assert.deepStrictEqual(result.messages, [
      {
        id: '+YJVTi',
        message: 'Hey!',
        filePath: 'test.tsx'
      }
    ]);
  });

  test('real_world', async () => {
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

    const result = await MessageExtractor.processFileContent('test.tsx', input);

    const expected = `import { useState } from 'react';
import { useTranslations } from 'next-intl';

function Component() {
    const [notification, setNotification] = useState();
    const t = useTranslations();

    function onClick() {
        setNotification(t("Successfully sent!"));
    }

    return (<div>
            <button onClick={onClick}>
                {t("9WRlF4")}
            </button>
            {notification}
        </div>);
}`;

    assert.strictEqual(normalizeCode(result.source), normalizeCode(expected));
    assert.deepStrictEqual(result.messages, [
      {
        id: '9WRlF4',
        message: 'Send',
        filePath: 'test.tsx'
      }
    ]);
  });

  test('renamed', async () => {
    const input = `import {useExtracted as useInlined} from 'next-intl';

function Component() {
    const t = useInlined();
    t("Hey!");
}`;

    const result = await MessageExtractor.processFileContent('test.tsx', input);

    const expected = `import { useTranslations } from 'next-intl';

function Component() {
    const t = useTranslations();
    t("+YJVTi");
}`;

    assert.strictEqual(normalizeCode(result.source), normalizeCode(expected));
    assert.deepStrictEqual(result.messages, [
      {
        id: '+YJVTi',
        message: 'Hey!',
        filePath: 'test.tsx'
      }
    ]);
  });

  // Additional tests for extract and both modes

  test('extract_mode', async () => {
    const input = `import {useExtracted} from 'next-intl';

function Component() {
    const t = useExtracted();
    t("Hello World!");
    t("Goodbye!");
}`;

    const result = await MessageExtractor.processFileContent('test.tsx', input);

    const expected = `import { useTranslations } from 'next-intl';

function Component() {
    const t = useTranslations();
    t("hhhE1n");
    t("NnE1NP");
}`;

    assert.deepStrictEqual(result.messages, [
      {
        id: 'hhhE1n',
        message: 'Hello World!',
        filePath: 'test.tsx'
      },
      {
        id: 'NnE1NP',
        message: 'Goodbye!',
        filePath: 'test.tsx'
      }
    ]);
    assert.strictEqual(normalizeCode(result.source), normalizeCode(expected));
  });

  test('both_mode', async () => {
    const input = `import {useExtracted} from 'next-intl';

function Component() {
    const t = useExtracted();
    t("Test message!");
}`;

    const result = await MessageExtractor.processFileContent('test.tsx', input);

    const expected = `import { useTranslations } from 'next-intl';

function Component() {
    const t = useTranslations();
    t("7XEV7l");
}`;

    assert.deepStrictEqual(result.messages, [
      {
        id: '7XEV7l',
        message: 'Test message!',
        filePath: 'test.tsx'
      }
    ]);
    assert.strictEqual(normalizeCode(result.source), normalizeCode(expected));
  });

  test('no_useExtracted', async () => {
    const input = `import {useTranslations} from 'next-intl';

function Component() {
    const t = useTranslations();
    t("Hello!");
}`;

    const result = await MessageExtractor.processFileContent('test.tsx', input);

    // Should return original source unchanged
    assert.strictEqual(result.source, input);
    assert.deepStrictEqual(result.messages, []);
  });
});

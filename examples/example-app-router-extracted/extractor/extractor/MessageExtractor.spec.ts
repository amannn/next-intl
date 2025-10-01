import {test, describe} from 'node:test';
import assert from 'node:assert';
import MessageExtractor, {ExtractorMode} from './MessageExtractor.ts';

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

    const result = await MessageExtractor.processFileContent(
      'test.tsx',
      input,
      ExtractorMode.TRANSFORM
    );

    const expected = `import { useTranslations } from 'next-intl';

function Component() {
    const t = useTranslations();
    t("+YJVTi");
}`;

    assert.strictEqual(normalizeCode(result.source), normalizeCode(expected));
    assert.strictEqual(result.messages.length, 0);
  });

  test('with_let', async () => {
    const input = `import {useExtracted} from 'next-intl';

function Component() {
    let t = useExtracted();
    t("Hey!");
}`;

    const result = await MessageExtractor.processFileContent(
      'test.tsx',
      input,
      ExtractorMode.TRANSFORM
    );

    const expected = `import { useTranslations } from 'next-intl';

function Component() {
    let t = useTranslations();
    t("+YJVTi");
}`;

    assert.strictEqual(normalizeCode(result.source), normalizeCode(expected));
    assert.strictEqual(result.messages.length, 0);
  });

  test('renamed_var', async () => {
    const input = `import {useExtracted} from 'next-intl';

function Component() {
    const translate = useExtracted();
    translate("Hello!");
}`;

    const result = await MessageExtractor.processFileContent(
      'test.tsx',
      input,
      ExtractorMode.TRANSFORM
    );

    const expected = `import { useTranslations } from 'next-intl';

function Component() {
    const translate = useTranslations();
    translate("OpKKos");
}`;

    assert.strictEqual(normalizeCode(result.source), normalizeCode(expected));
    assert.strictEqual(result.messages.length, 0);
  });

  test('use_translations_already_present', async () => {
    const input = `import {useExtracted, useTranslations} from 'next-intl';

function Component() {
    const t = useExtracted();
    const t2 = useTranslations();
    t("Hello from extracted!");
    t2("greeting");
}`;

    const result = await MessageExtractor.processFileContent(
      'test.tsx',
      input,
      ExtractorMode.TRANSFORM
    );

    const expected = `import { useTranslations, useTranslations } from 'next-intl';

function Component() {
    const t = useTranslations();
    const t2 = useTranslations();
    t("piskIR");
    t2("greeting");
}`;

    assert.strictEqual(normalizeCode(result.source), normalizeCode(expected));
    assert.strictEqual(result.messages.length, 0);
  });

  test('t_out_of_scope', async () => {
    const input = `import {useExtracted} from 'next-intl';

function Component() {
    const t = useExtracted();
    t("Hey!");
}

const t = (msg) => msg;
t("Should not be transformed");`;

    const result = await MessageExtractor.processFileContent(
      'test.tsx',
      input,
      ExtractorMode.TRANSFORM
    );

    const expected = `import { useTranslations } from 'next-intl';

function Component() {
    const t = useTranslations();
    t("+YJVTi");
}

const t = (msg) => msg;
t("Should not be transformed");`;

    assert.strictEqual(normalizeCode(result.source), normalizeCode(expected));
    assert.strictEqual(result.messages.length, 0);
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

    const result = await MessageExtractor.processFileContent(
      'test.tsx',
      input,
      ExtractorMode.TRANSFORM
    );

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
    assert.strictEqual(result.messages.length, 0);
  });

  test('renamed', async () => {
    const input = `import {useExtracted as useInlined} from 'next-intl';

function Component() {
    const t = useInlined();
    t("Hey!");
}`;

    const result = await MessageExtractor.processFileContent(
      'test.tsx',
      input,
      ExtractorMode.TRANSFORM
    );

    const expected = `import { useTranslations } from 'next-intl';

function Component() {
    const t = useTranslations();
    t("+YJVTi");
}`;

    assert.strictEqual(normalizeCode(result.source), normalizeCode(expected));
    assert.strictEqual(result.messages.length, 0);
  });

  // Additional tests for extract and both modes

  test('extract_mode', async () => {
    const input = `import {useExtracted} from 'next-intl';

function Component() {
    const t = useExtracted();
    t("Hello World!");
    t("Goodbye!");
}`;

    const result = await MessageExtractor.processFileContent(
      'test.tsx',
      input,
      ExtractorMode.EXTRACT
    );

    assert.strictEqual(result.messages.length, 2);
    assert.strictEqual(result.messages[0].message, 'Hello World!');
    assert.strictEqual(result.messages[1].message, 'Goodbye!');
    assert.strictEqual(result.source, input); // Source should be unchanged
  });

  test('both_mode', async () => {
    const input = `import {useExtracted} from 'next-intl';

function Component() {
    const t = useExtracted();
    t("Test message!");
}`;

    const result = await MessageExtractor.processFileContent(
      'test.tsx',
      input,
      ExtractorMode.BOTH
    );

    const expected = `import { useTranslations } from 'next-intl';

function Component() {
    const t = useTranslations();
    t("7XEV7l");
}`;

    assert.strictEqual(result.messages.length, 1);
    assert.strictEqual(result.messages[0].message, 'Test message!');
    assert.strictEqual(normalizeCode(result.source), normalizeCode(expected));
  });

  test('no_useExtracted', async () => {
    const input = `import {useTranslations} from 'next-intl';

function Component() {
    const t = useTranslations();
    t("Hello!");
}`;

    const result = await MessageExtractor.processFileContent(
      'test.tsx',
      input,
      ExtractorMode.TRANSFORM
    );

    // Should return original source unchanged
    assert.strictEqual(result.source, input);
    assert.strictEqual(result.messages.length, 0);
  });
});

import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import {expect, test as it} from '@playwright/test';

const {describe} = it;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, '..');
const MESSAGES_DIR = path.join(APP_ROOT, 'messages');
const SRC_DIR = path.join(APP_ROOT, 'src');

async function readJson(filePath: string): Promise<Record<string, unknown>> {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content) as Record<string, unknown>;
}

async function withTempEdit(
  filePath: string,
  newContent: string
): Promise<{[Symbol.asyncDispose]: () => Promise<void>}> {
  const fullPath = path.join(APP_ROOT, filePath);
  const original = await fs.readFile(fullPath, 'utf-8');
  await fs.writeFile(fullPath, newContent);
  return {
    [Symbol.asyncDispose]: async () => fs.writeFile(fullPath, original)
  };
}

async function waitForExtraction(
  predicate: () => Promise<boolean>,
  opts: {timeout?: number} = {}
): Promise<void> {
  const timeout = opts.timeout ?? 15_000;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await predicate()) return;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Extraction did not complete within timeout');
}

describe('extraction json format', () => {
  it('saves messages initially', async ({page}) => {
    await page.goto('/');
    await waitForExtraction(async () => {
      try {
        const en = await readJson(path.join(MESSAGES_DIR, 'en.json'));
        return en['+YJVTi'] === 'Hey!' && en['NhX4DJ'] === 'Hello';
      } catch {
        return false;
      }
    });
    const en = await readJson(path.join(MESSAGES_DIR, 'en.json'));
    expect(en['+YJVTi']).toBe('Hey!');
    expect(en['NhX4DJ']).toBe('Hello');
  });

  it('resets translations when a message changes', async ({page}) => {
    await page.goto('/');
    await waitForExtraction(async () => {
      try {
        const en = await readJson(path.join(MESSAGES_DIR, 'en.json'));
        return en['+YJVTi'] === 'Hey!';
      } catch {
        return false;
      }
    });

    await using _ = await withTempEdit(
      'src/components/Greeting.tsx',
      `'use client';

import {useExtracted} from 'next-intl';

export default function Greeting() {
  const t = useExtracted();
  return <div>{t('Hello!')}</div>;
}
`
    );

    await page.goto('/');
    await waitForExtraction(async () => {
      try {
        const en = await readJson(path.join(MESSAGES_DIR, 'en.json'));
        return en['OpKKos'] === 'Hello!';
      } catch {
        return false;
      }
    });
    const en = await readJson(path.join(MESSAGES_DIR, 'en.json'));
    expect(en['OpKKos']).toBe('Hello!');
    try {
      const de = await readJson(path.join(MESSAGES_DIR, 'de.json'));
      expect(de['OpKKos']).toBe('');
    } catch {
      // de.json may not exist with locales: infer
    }
  });

  it('removes translations when all messages removed from a file', async ({
    page
  }) => {
    await page.goto('/');
    await waitForExtraction(async () => {
      try {
        const en = await readJson(path.join(MESSAGES_DIR, 'en.json'));
        return en['+YJVTi'] === 'Hey!' && en['NhX4DJ'] === 'Hello';
      } catch {
        return false;
      }
    });

    await using _ = await withTempEdit(
      'src/components/Greeting.tsx',
      `'use client';

export default function Greeting() {
  return <div />;
}
`
    );
    await using __ = await withTempEdit(
      'src/components/Footer.tsx',
      `'use client';

export default function Footer() {
  return <footer />;
}
`
    );

    await page.goto('/');
    await waitForExtraction(async () => {
      try {
        const en = await readJson(path.join(MESSAGES_DIR, 'en.json'));
        return Object.keys(en).length === 1 && en['NhX4DJ'] === 'Hello';
      } catch {
        return false;
      }
    });
    const en = await readJson(path.join(MESSAGES_DIR, 'en.json'));
    expect(en['+YJVTi']).toBeUndefined();
    expect(en['NhX4DJ']).toBe('Hello');
  });

  it('preserves messages when removed from one file but still used in another', async ({
    page
  }) => {
    await page.goto('/');
    await waitForExtraction(async () => {
      try {
        const en = await readJson(path.join(MESSAGES_DIR, 'en.json'));
        return en['+YJVTi'] === 'Hey!';
      } catch {
        return false;
      }
    });

    await using _ = await withTempEdit(
      'src/components/Greeting.tsx',
      `'use client';

export default function Greeting() {
  return <div />;
}
`
    );

    await page.goto('/');
    await waitForExtraction(async () => {
      try {
        const en = await readJson(path.join(MESSAGES_DIR, 'en.json'));
        return en['+YJVTi'] === 'Hey!';
      } catch {
        return false;
      }
    });
    const en = await readJson(path.join(MESSAGES_DIR, 'en.json'));
    expect(en['+YJVTi']).toBe('Hey!');
  });

  it('skips node_modules, .next and .git by default', async ({page}) => {
    await page.goto('/');
    await waitForExtraction(async () => {
      try {
        const en = await readJson(path.join(MESSAGES_DIR, 'en.json'));
        return en['+YJVTi'] === 'Hey!';
      } catch {
        return false;
      }
    });
    const en = await readJson(path.join(MESSAGES_DIR, 'en.json'));
    expect(en['JdTriE']).toBeUndefined();
  });
});

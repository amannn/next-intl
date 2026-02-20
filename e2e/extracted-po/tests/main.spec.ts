import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import {expect, test as it} from '@playwright/test';

const {describe} = it;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, '..');
const MESSAGES_DIR = path.join(APP_ROOT, 'messages');

async function readPo(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
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

describe('extraction po format', () => {
  it('saves messages initially', async ({page}) => {
    await page.goto('/');
    await waitForExtraction(async () => {
      try {
        const content = await readPo(path.join(MESSAGES_DIR, 'en.po'));
        return (
          content.includes('msgid "+YJVTi"') &&
          content.includes('msgstr "Hey!"')
        );
      } catch {
        return false;
      }
    });
    const content = await readPo(path.join(MESSAGES_DIR, 'en.po'));
    expect(content).toContain('msgid "+YJVTi"');
    expect(content).toContain('msgstr "Hey!"');
  });
});

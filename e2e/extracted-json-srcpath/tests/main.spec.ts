import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import {expect, test as it} from '@playwright/test';

const {describe} = it;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, '..');
const MESSAGES_DIR = path.join(APP_ROOT, 'messages');

async function readJson(filePath: string): Promise<Record<string, unknown>> {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content) as Record<string, unknown>;
}

async function waitForExtraction(
  predicate: () => Promise<boolean>,
  opts: {timeout?: number} = {}
): Promise<void> {
  const timeout = opts.timeout ?? 30_000;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await predicate()) return;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Extraction did not complete within timeout');
}

describe('srcPath includes node_modules when explicitly requested', () => {
  it('includes node_modules if explicitly requested', async ({page}) => {
    await page.goto('/');
    await waitForExtraction(async () => {
      try {
        const en = await readJson(path.join(MESSAGES_DIR, 'en.json'));
        return en['Cq+Nds'] === 'Profile card';
      } catch {
        return false;
      }
    });
    const en = await readJson(path.join(MESSAGES_DIR, 'en.json'));
    expect(en['Cq+Nds']).toBe('Profile card');
  });
});

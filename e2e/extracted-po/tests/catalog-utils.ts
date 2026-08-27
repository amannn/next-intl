import fs from 'fs/promises';
import path from 'path';
import {expect} from '@playwright/test';

export function getPoEntry(poContent: string, id: string): string | null {
  const blocks = poContent.split(/\n\n+/);
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = blocks.find((b) => new RegExp(`msgctxt "${escaped}"`).test(b));
  return block ? block.trim() : null;
}

export function createPoCatalogUtils(messagesDir: string) {
  return {
    async expectCatalog(
      file: string,
      predicate: (content: string) => boolean,
      opts?: {timeout?: number}
    ): Promise<string> {
      const filePath = path.join(messagesDir, file);
      await expect
        .poll(
          async () => {
            try {
              const content = await fs.readFile(filePath, 'utf-8');
              return predicate(content);
            } catch {
              return false;
            }
          },
          opts?.timeout ? {timeout: opts.timeout} : undefined
        )
        .toBe(true);
      return fs.readFile(filePath, 'utf-8');
    }
  };
}

import fs from 'fs/promises';
import path from 'path';
import {expect} from '@playwright/test';

export {
  withTempEdit,
  withTempFile,
  withTempRemove
} from '../../extracted-json/tests/helpers.js';

/** Extract full PO entry block for msgctxt (custom format uses msgctxt as id) */
export function getPoEntryByMsgctxt(poContent: string, msgctxt: string): string | null {
  const blocks = poContent.split(/\n\n+/);
  const escaped = msgctxt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = blocks.find((b) => new RegExp(`msgctxt "${escaped}"`).test(b));
  return block ? block.trim() : null;
}

export function createExtractionHelpers(messagesDir: string) {
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

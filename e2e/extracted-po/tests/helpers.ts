import fs from 'fs/promises';
import path from 'path';
import {expect} from '@playwright/test';

export {
  withTempEdit,
  withTempFile,
  withTempRemove
} from '../../extracted-json/tests/helpers.js';

/** Extract full PO entry block for msgid (refs + comment + msgctxt + msgid + msgstr) */
export function getPoEntry(poContent: string, msgid: string): string | null {
  const blocks = poContent.split(/\n\n+/);
  const escaped = msgid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = blocks.find((b) => new RegExp(`msgid "${escaped}"`).test(b));
  return block ? block.trim() : null;
}

export function createExtractionHelpers(messagesDir: string) {
  return {
    async expectCatalog(
      file: string,
      predicate: (content: string) => boolean
    ): Promise<string> {
      const filePath = path.join(messagesDir, file);
      await expect
        .poll(async () => {
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            return predicate(content);
          } catch {
            return false;
          }
        })
        .toBe(true);
      return fs.readFile(filePath, 'utf-8');
    }
  };
}

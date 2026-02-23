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
  const escaped = msgid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `(?:^|\\n\\n)(((?:#:[^\\n]*\\n|#\\.[^\\n]*\\n)*(?:msgctxt "[^"]*"\\n)?msgid "${escaped}"\\nmsgstr "[^"]*"))`,
    'm'
  );
  const match = poContent.match(re);
  return match ? match[1].trim() : null;
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

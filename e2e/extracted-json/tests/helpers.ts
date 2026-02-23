import fs from 'fs/promises';
import path from 'path';
import {expect} from '@playwright/test';

export async function withTempEdit(
  appRoot: string,
  filePath: string,
  newContent: string
): Promise<{[Symbol.asyncDispose]: () => Promise<void>}> {
  const fullPath = path.join(appRoot, filePath);
  const original = await fs.readFile(fullPath, 'utf-8');
  await fs.writeFile(fullPath, newContent);
  return {
    [Symbol.asyncDispose]: async () => fs.writeFile(fullPath, original)
  };
}

export async function withTempFile(
  appRoot: string,
  filePath: string,
  content: string
): Promise<{[Symbol.asyncDispose]: () => Promise<void>}> {
  const fullPath = path.join(appRoot, filePath);
  let existed = true;
  let original = '';
  try {
    original = await fs.readFile(fullPath, 'utf-8');
  } catch {
    existed = false;
  }
  await fs.writeFile(fullPath, content);
  return {
    [Symbol.asyncDispose]: async () => {
      if (existed) {
        await fs.writeFile(fullPath, original);
      } else {
        await fs.unlink(fullPath);
      }
    }
  };
}

export async function withTempRemove(
  appRoot: string,
  filePath: string
): Promise<{[Symbol.asyncDispose]: () => Promise<void>}> {
  const fullPath = path.join(appRoot, filePath);
  const original = await fs.readFile(fullPath, 'utf-8');
  await fs.unlink(fullPath);
  return {
    [Symbol.asyncDispose]: async () => fs.writeFile(fullPath, original)
  };
}

export function createExtractionHelpers(messagesDir: string) {
  return {
    async expectJson(
      file: string,
      expected: Record<string, unknown>
    ): Promise<Record<string, unknown>> {
      const filePath = path.join(messagesDir, file);
      await expect
        .poll(async () => {
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content) as Record<string, unknown>;
          } catch {
            return null;
          }
        })
        .toMatchObject(expected);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as Record<string, unknown>;
    },

    async expectJsonPredicate(
      file: string,
      predicate: (json: Record<string, unknown>) => boolean
    ): Promise<Record<string, unknown>> {
      const filePath = path.join(messagesDir, file);
      await expect
        .poll(async () => {
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            const json = JSON.parse(content) as Record<string, unknown>;
            return predicate(json);
          } catch {
            return false;
          }
        })
        .toBe(true);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as Record<string, unknown>;
    },

    async expectPo(
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

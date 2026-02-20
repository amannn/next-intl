import fs from 'fs/promises';
import path from 'path';
import {expect} from '@playwright/test';

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

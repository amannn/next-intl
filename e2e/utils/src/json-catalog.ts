import fs from 'fs/promises';
import path from 'path';
import {expect} from '@playwright/test';

export function createJsonCatalogUtils(messagesDir: string) {
  return {
    async expectCatalog(
      file: string,
      expected: Record<string, unknown>,
      opts?: {timeout?: number}
    ): Promise<Record<string, unknown>> {
      const filePath = path.join(messagesDir, file);
      await expect
        .poll(
          async () => {
            try {
              const content = await fs.readFile(filePath, 'utf-8');
              return JSON.parse(content) as Record<string, unknown>;
            } catch {
              return null;
            }
          },
          opts?.timeout ? {timeout: opts.timeout} : undefined
        )
        .toMatchObject(expected);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as Record<string, unknown>;
    },

    async expectCatalogPredicate(
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
    }
  };
}

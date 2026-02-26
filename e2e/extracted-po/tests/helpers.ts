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
  const log =
    process.env.DEBUG_EXTRACTION_PO !== undefined
      ? (msg: string) => console.log(msg)
      : () => {};
  return {
    async expectCatalog(
      file: string,
      predicate: (content: string) => boolean,
      expectOpts?: {timeout?: number; debugLabel?: string}
    ): Promise<string> {
      const filePath = path.join(messagesDir, file);
      const start = Date.now();
      let pollCount = 0;
      await expect
        .poll(
          async () => {
            pollCount++;
            const elapsed = Date.now() - start;
            try {
              const content = await fs.readFile(filePath, 'utf-8');
              const result = predicate(content);
              if (expectOpts?.debugLabel) {
                const heyEntry = getPoEntry(content, '+YJVTi');
                const howdyEntry = getPoEntry(content, '4xqPlJ');
                log(
                  `[${expectOpts.debugLabel}] poll #${pollCount} t=${elapsed}ms result=${result} ` +
                    `heyEntry=${heyEntry != null} howdyEntry=${howdyEntry != null} ` +
                    `heyHasFooter=${heyEntry?.includes('Footer.tsx') ?? false} ` +
                    `heyHasGreeting=${heyEntry?.includes('Greeting.tsx') ?? false}`
                );
                if (!result && heyEntry != null) {
                  log(`[${expectOpts.debugLabel}] heyEntry content: ${heyEntry}`);
                }
              }
              return result;
            } catch (error) {
              if (expectOpts?.debugLabel) {
                log(
                  `[${expectOpts.debugLabel}] poll #${pollCount} t=${elapsed}ms error=${String(error)}`
                );
              }
              return false;
            }
          },
          expectOpts?.timeout ? {timeout: expectOpts.timeout} : undefined
        )
        .toBe(true);
      return fs.readFile(filePath, 'utf-8');
    }
  };
}

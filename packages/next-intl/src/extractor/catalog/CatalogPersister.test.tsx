// @vitest-environment node
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type ExtractorCodec from '../format/ExtractorCodec.js';
import CatalogPersister from './CatalogPersister.js';

describe('write', () => {
  const extension = '.json';
  const oldContent = '{"a": "old"}\n';
  let dir: string;
  let target: string;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'next-intl-persister-'));
    target = path.join(dir, 'en.json');
    await fs.writeFile(target, oldContent);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(dir, {force: true, recursive: true});
  });

  function createPersister(encode: () => string) {
    return new CatalogPersister({
      messagesPath: dir,
      codec: {encode} as unknown as ExtractorCodec,
      extension,
      sourceLocale: 'en'
    });
  }

  function write(persister: CatalogPersister) {
    return persister.write([], {
      locale: 'en',
      sourceMessagesById: new Map()
    });
  }

  it('keeps the previous content readable while the new content is being written', async () => {
    const newContent = '{"a": "new"}\n'.repeat(1000);
    const originalWriteFile = fs.writeFile.bind(fs);
    const observed: Array<string> = [];

    vi.spyOn(fs, 'writeFile').mockImplementation(async (file, data) => {
      // Simulate a slow write, during which a reader (e.g. a build)
      // accesses the catalog
      await originalWriteFile(file, String(data).slice(0, 5));
      observed.push(await fs.readFile(target, 'utf8'));
      await originalWriteFile(file, data);
    });

    await write(createPersister(() => newContent));

    expect(observed).toEqual([oldContent]);
    expect(await fs.readFile(target, 'utf8')).toBe(newContent);
    expect(await fs.readdir(dir)).toEqual(['en.json']);
  });

  it.each([
    [
      'writeFile',
      () => {
        const originalWriteFile = fs.writeFile.bind(fs);
        vi.spyOn(fs, 'writeFile').mockImplementation(async (file) => {
          await originalWriteFile(file, 'partial');
          throw new Error('Disk failure');
        });
      }
    ],
    [
      'rename',
      () => {
        vi.spyOn(fs, 'rename').mockRejectedValue(new Error('Disk failure'));
      }
    ]
  ])(
    'keeps the previous content and removes the temporary file if `%s` fails',
    async (_name, makeFail) => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      makeFail();

      await write(createPersister(() => '{"a": "new"}\n'));

      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to write catalog')
      );
      expect(await fs.readFile(target, 'utf8')).toBe(oldContent);
      expect(await fs.readdir(dir)).toEqual(['en.json']);
    }
  );

  it('uses unique temporary files that are not mistaken for catalogs', async () => {
    const tempFiles: Array<string> = [];
    const originalWriteFile = fs.writeFile.bind(fs);
    vi.spyOn(fs, 'writeFile').mockImplementation(async (file, data) => {
      tempFiles.push(path.basename(String(file)));
      await originalWriteFile(file, data);
    });

    await Promise.all([
      write(createPersister(() => '{"a": "1"}\n')),
      write(createPersister(() => '{"a": "2"}\n'))
    ]);

    expect(new Set(tempFiles).size).toBe(2);
    for (const file of tempFiles) {
      expect(file.endsWith(extension)).toBe(false);
    }
    expect(await fs.readdir(dir)).toEqual(['en.json']);
  });
});

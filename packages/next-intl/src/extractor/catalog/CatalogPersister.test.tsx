import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import {describe, expect, it, vi} from 'vitest';
import CatalogPersister from './CatalogPersister.js';

describe('CatalogPersister', () => {
  it('reads empty file as empty catalog without calling decode', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'next-intl-persister-'));
    try {
      await fs.writeFile(path.join(dir, 'fr.json'), '');
      const decode = vi.fn();
      const persister = new CatalogPersister({
        codec: {
          decode,
          encode: vi.fn(),
          toJSONString: vi.fn()
        },
        extension: '.json',
        messagesPath: dir
      });
      await expect(persister.read('fr')).resolves.toEqual([]);
      expect(decode).not.toHaveBeenCalled();
    } finally {
      await fs.rm(dir, {recursive: true});
    }
  });

  it('reads whitespace-only file as empty catalog', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'next-intl-persister-'));
    try {
      await fs.writeFile(path.join(dir, 'fr.json'), '  \n\t  ');
      const decode = vi.fn();
      const persister = new CatalogPersister({
        codec: {
          decode,
          encode: vi.fn(),
          toJSONString: vi.fn()
        },
        extension: '.json',
        messagesPath: dir
      });
      await expect(persister.read('fr')).resolves.toEqual([]);
      expect(decode).not.toHaveBeenCalled();
    } finally {
      await fs.rm(dir, {recursive: true});
    }
  });
});

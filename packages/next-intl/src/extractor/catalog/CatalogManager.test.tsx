import {describe, expect, it, vi} from 'vitest';
import CatalogManager from './CatalogManager.js';
import type {ExtractedMessage, ExtractorConfig} from '../types.js';

describe('CatalogManager', () => {
  describe('reference ordering', () => {
    it('sorts references alphabetically when merging shared messages', async () => {
      const config: ExtractorConfig = {
        srcPath: './src',
        sourceLocale: 'en',
        messages: {
          format: 'po',
          locales: 'infer',
          path: './messages'
        }
      };
      const manager = new CatalogManager(config, {projectRoot: '/project'});

      const processFileContent = vi
        .fn<
          [string, string],
          Promise<{messages: Array<ExtractedMessage>; source: string}>
        >()
        .mockImplementationOnce(async (_filePath, source) => ({
          messages: [
            {
              id: 'shared',
              message: 'Shared',
              references: [{path: 'src/zeta.tsx'}]
            }
          ],
          source
        }))
        .mockImplementationOnce(async (_filePath, source) => ({
          messages: [
            {
              id: 'shared',
              message: 'Shared',
              references: [{path: 'src/alpha.tsx'}]
            }
          ],
          source
        }));

      (manager as unknown as {
        messageExtractor: {
          processFileContent: typeof processFileContent;
        };
      }).messageExtractor = {processFileContent};

      await manager.extractFileMessages('/project/src/zeta.tsx', 'first');
      await manager.extractFileMessages('/project/src/alpha.tsx', 'second');

      const messagesById = (manager as unknown as {
        messagesById: Map<string, ExtractedMessage>;
      }).messagesById;

      const message = messagesById.get('shared');
      expect(
        message?.references?.map((reference) => reference.path)
      ).toEqual(['src/alpha.tsx', 'src/zeta.tsx']);
    });
  });
});

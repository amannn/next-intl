import {describe, expect, it} from 'vitest';
import type {CatalogLoaderConfig} from '../../extractor/types.js';
import type {TurbopackLoaderContext} from '../types.js';
import catalogLoader from './catalogLoader.js';

const catalog = `msgid ""
msgstr ""
"Language: en\\n"
"X-Message-Key: msgctxt\\n"

msgctxt "greeting"
msgid "Hello"
msgstr ""
`;

function loadCatalog(options: CatalogLoaderConfig) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const context = {
      getOptions: () => options,
      rootContext: process.cwd(),
      resourcePath: '/app/messages/en.po',
      async: () => (error: Error | null, result?: string) => {
        if (error) {
          reject(error);
        } else {
          resolve(
            JSON.parse(
              // `export default JSON.parse("…");`
              JSON.parse(result!.slice('export default JSON.parse('.length, -2))
            )
          );
        }
      }
    } as unknown as TurbopackLoaderContext<CatalogLoaderConfig>;

    catalogLoader.call(context, catalog);
  });
}

describe('catalogLoader', () => {
  it('resolves messages from the source catalog', async () => {
    expect(
      await loadCatalog({messages: {format: 'po', sourceLocale: 'en'}})
    ).toEqual({greeting: 'Hello'});
  });

  it('can load catalogs when no source locale is configured', async () => {
    expect(await loadCatalog({messages: {format: 'po'}})).toEqual({
      greeting: ''
    });
  });
});

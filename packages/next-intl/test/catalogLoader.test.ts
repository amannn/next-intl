import {beforeEach, describe, expect, it, vi} from 'vitest';

const compileMock = vi.fn((message: string) => `__compiled__${message}`);

vi.mock('icu-minify/compiler', () => ({default: compileMock}));

type MessagesConfig = {
  format: 'json';
  locales: 'infer';
  path: string;
  precompile: true;
};

type CatalogLoaderConfig = {
  messages: MessagesConfig;
};

type LoaderContext = {
  getOptions(): CatalogLoaderConfig;
  async(): (error: unknown, result?: string) => void;
  resourcePath: string;
  rootContext: string;
};

function getDefaultOptions(): CatalogLoaderConfig {
  return {
    messages: {
      format: 'json',
      locales: 'infer',
      path: './messages',
      precompile: true
    }
  };
}

async function runCatalogLoader(params: {
  options?: CatalogLoaderConfig;
  resourcePath: string;
  rootContext?: string;
  source: string;
}): Promise<string> {
  const {default: catalogLoader} = await import(
    '../src/plugin/catalog/catalogLoader.tsx'
  );

  const options = params.options ?? getDefaultOptions();
  const rootContext = params.rootContext ?? process.cwd();

  return await new Promise((resolve, reject) => {
    const context: LoaderContext = {
      async() {
        return (error, result) => {
          if (error) reject(error);
          else resolve(result!);
        };
      },
      getOptions() {
        return options;
      },
      resourcePath: params.resourcePath,
      rootContext
    };

    catalogLoader.call(context, params.source);
  });
}

function getPrecompiledObject(loaderResult: string): Record<string, unknown> {
  const match = loaderResult.match(/export default JSON\.parse\((.*)\);$/);
  expect(match).not.toBeNull();

  const outputString = JSON.parse(match![1]);
  return JSON.parse(outputString);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe('catalogLoader precompile cache', () => {
  it('reuses compiled messages for unchanged source', async () => {
    const source = JSON.stringify({hello: 'Hello', world: 'World'});
    await runCatalogLoader({resourcePath: '/messages/en.json', source});
    await runCatalogLoader({resourcePath: '/messages/en.json', source});

    expect(compileMock).toHaveBeenCalledTimes(2);
  });

  it('recompiles only the changed message', async () => {
    const sourceA = JSON.stringify({hello: 'Hello', world: 'World'});
    const sourceB = JSON.stringify({hello: 'Hello!!!', world: 'World'});

    await runCatalogLoader({resourcePath: '/messages/en.json', source: sourceA});
    await runCatalogLoader({resourcePath: '/messages/en.json', source: sourceB});

    expect(compileMock).toHaveBeenCalledTimes(3);
  });

  it('evicts removed messages and recompiles when they reappear', async () => {
    const sourceA = JSON.stringify({hello: 'Hello', world: 'World'});
    const sourceB = JSON.stringify({hello: 'Hello'});

    await runCatalogLoader({resourcePath: '/messages/en.json', source: sourceA});
    await runCatalogLoader({resourcePath: '/messages/en.json', source: sourceB});
    await runCatalogLoader({resourcePath: '/messages/en.json', source: sourceA});

    expect(compileMock).toHaveBeenCalledTimes(3);
  });

  it('does not share cache across different catalogs', async () => {
    const source = JSON.stringify({hello: 'Hello', world: 'World'});

    await runCatalogLoader({resourcePath: '/messages/en.json', source});
    await runCatalogLoader({resourcePath: '/messages/de.json', source});
    await runCatalogLoader({resourcePath: '/messages/en.json', source});

    expect(compileMock).toHaveBeenCalledTimes(4);
  });

  it('emits precompiled messages', async () => {
    const source = JSON.stringify({hello: 'Hello'});
    const result = await runCatalogLoader({resourcePath: '/messages/en.json', source});
    const precompiled = getPrecompiledObject(result);

    expect(precompiled).toEqual({hello: '__compiled__Hello'});
  });
});


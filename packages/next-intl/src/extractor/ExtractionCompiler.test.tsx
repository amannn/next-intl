import fs from 'fs/promises';
import path from 'path';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import ExtractionCompiler from './ExtractionCompiler.js';

const filesystem: {
  project: {
    src: Record<string, string>;
    messages: Record<string, string> | undefined;
    node_modules?: Record<'@acme', Record<'ui', Record<string, string>>>;
    '.next'?: Record<string, Record<string, string>>;
    '.git'?: Record<string, Record<string, string>>;
  };
} = {
  project: {
    src: {},
    messages: undefined
  }
};

const fileTimestamps = new Map<string, Date>();
const watchCallbacks: Map<string, (event: string, filename: string) => void> =
  new Map();
const mockWatchers: Map<string, {close(): void}> = new Map();
const readFileInterceptors = new Map<string, () => Promise<void>>();
const parcelWatcherCallbacks = new Map<
  string,
  (err: Error | null, events: Array<{type: string; path: string}>) => void
>();
const parcelWatcherSubscriptions = new Map<
  string,
  {unsubscribe(): Promise<void>}
>();

beforeEach(() => {
  filesystem.project = {
    src: {},
    messages: {}
  };
  delete (filesystem as Record<string, unknown>).ui;
  fileTimestamps.clear();
  watchCallbacks.clear();
  mockWatchers.clear();
  readFileInterceptors.clear();
  parcelWatcherCallbacks.clear();
  parcelWatcherSubscriptions.clear();
  vi.clearAllMocks();
});

function getNestedValue(obj: unknown, pathname: string): unknown {
  const pathParts = pathname.startsWith('/')
    ? pathname.replace(/^\//, '').split('/')
    : ['project', ...pathname.split('/')];
  return pathParts.reduce(
    (current: unknown, key) =>
      current != null &&
      typeof current === 'object' &&
      key in (current as object)
        ? (current as Record<string, unknown>)[key]
        : undefined,
    obj
  );
}

function setNestedValue(obj: unknown, pathname: string, value: string): void {
  const pathParts = pathname.startsWith('/')
    ? pathname.replace(/^\//, '').split('/')
    : ['project', ...pathname.split('/')];
  let current = obj as Record<string, unknown>;
  for (let i = 0; i < pathParts.length - 1; i++) {
    const key = pathParts[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[pathParts[pathParts.length - 1]] = value;
}

function checkDirectoryExists(obj: unknown, dirPath: string): boolean {
  const pathParts = dirPath.startsWith('/')
    ? dirPath.replace(/^\//, '').split('/').filter(Boolean)
    : ['project', ...dirPath.split('/').filter(Boolean)];
  let current: unknown = obj;
  for (const part of pathParts) {
    if (
      current != null &&
      typeof current === 'object' &&
      part in (current as object)
    ) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return false;
    }
  }
  return current !== undefined && typeof current === 'object';
}

function getDirectoryContents(obj: unknown, dirPath: string): Array<string> {
  const pathParts = dirPath.startsWith('/')
    ? dirPath.replace(/^\//, '').split('/').filter(Boolean)
    : ['project', ...dirPath.split('/').filter(Boolean)];
  let current: unknown = obj;
  for (const part of pathParts) {
    if (
      current != null &&
      typeof current === 'object' &&
      part in (current as object)
    ) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return [];
    }
  }
  if (current != null && typeof current === 'object') {
    return Object.keys(current as object);
  }
  return [];
}

function waitForWriteFileCalls(
  length: number,
  opts: {atLeast?: boolean} = {}
): Promise<void> {
  return vi.waitFor(() => {
    if (opts.atLeast) {
      expect(vi.mocked(fs.writeFile).mock.calls.length).toBeGreaterThanOrEqual(
        length
      );
    } else {
      expect(vi.mocked(fs.writeFile).mock.calls.length).toBe(length);
    }
  });
}

function createENOENTError(filePath: string): NodeJS.ErrnoException {
  const error = new Error(
    `ENOENT: no such file or directory, open '${filePath}'`
  ) as NodeJS.ErrnoException;
  error.code = 'ENOENT';
  error.errno = -2;
  error.syscall = 'open';
  error.path = filePath;
  return error;
}

vi.mock('@parcel/watcher', () => ({
  subscribe: vi.fn(
    async (
      rootPath: string,
      callback: (
        err: Error | null,
        events: Array<{type: string; path: string}>
      ) => void
    ) => {
      parcelWatcherCallbacks.set(rootPath, callback);
      const normalizedPath = path.resolve(rootPath);
      if (normalizedPath !== rootPath) {
        parcelWatcherCallbacks.set(normalizedPath, callback);
      }
      if (!rootPath.startsWith('/')) {
        parcelWatcherCallbacks.set(
          path.join(process.cwd(), rootPath),
          callback
        );
      }
      const subscription = {
        unsubscribe: vi.fn(async () => {
          parcelWatcherCallbacks.delete(rootPath);
          if (normalizedPath !== rootPath) {
            parcelWatcherCallbacks.delete(normalizedPath);
          }
          if (!rootPath.startsWith('/')) {
            parcelWatcherCallbacks.delete(path.join(process.cwd(), rootPath));
          }
          parcelWatcherSubscriptions.delete(rootPath);
        })
      };
      parcelWatcherSubscriptions.set(rootPath, subscription);
      return subscription;
    }
  )
}));

vi.mock('fs', () => ({
  default: {
    watch: vi.fn(
      (
        dirPath: string,
        _options: {persistent: boolean; recursive: boolean},
        callback: (event: string, filename: string) => void
      ) => {
        watchCallbacks.set(dirPath, callback);
        if (dirPath.startsWith('/')) {
          watchCallbacks.set(path.resolve(dirPath), callback);
        } else {
          watchCallbacks.set(path.join(process.cwd(), dirPath), callback);
        }
        const watcher = {
          close: vi.fn(() => {
            watchCallbacks.delete(dirPath);
            if (dirPath.startsWith('/')) {
              watchCallbacks.delete(path.resolve(dirPath));
            } else {
              watchCallbacks.delete(path.join(process.cwd(), dirPath));
            }
            mockWatchers.delete(dirPath);
          })
        };
        mockWatchers.set(dirPath, watcher);
        return watcher;
      }
    )
  }
}));

vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(async (filePath: string) => {
      for (const [key, interceptor] of readFileInterceptors) {
        if (filePath.endsWith(key)) {
          await interceptor();
        }
      }
      const content = getNestedValue(filesystem, filePath);
      if (typeof content === 'string') {
        return content;
      }
      throw createENOENTError(filePath);
    }),
    readdir: vi.fn(async (dir: string, opts?: {withFileTypes?: boolean}) => {
      const dirExists = checkDirectoryExists(filesystem, dir);
      if (!dirExists) {
        throw new Error('Directory not found: ' + dir);
      }
      const contents = getDirectoryContents(filesystem, dir);
      const pathParts = dir.startsWith('/')
        ? dir.replace(/^\//, '').split('/').filter(Boolean)
        : ['project', ...dir.split('/').filter(Boolean)];
      let current: unknown = filesystem;
      for (const part of pathParts) {
        if (
          current != null &&
          typeof current === 'object' &&
          part in (current as object)
        ) {
          current = (current as Record<string, unknown>)[part];
        }
      }
      if (opts?.withFileTypes) {
        return contents.map((name) => {
          const value =
            current != null && typeof current === 'object'
              ? (current as Record<string, unknown>)[name]
              : undefined;
          const isDir = value != null && typeof value === 'object';
          return {
            name,
            isDirectory: () => isDir,
            isFile: () => !isDir
          };
        });
      }
      return contents;
    }),
    mkdir: vi.fn(async () => {}),
    writeFile: vi.fn(async (filePath: string, content: string) => {
      setNestedValue(filesystem, filePath, content);
      fileTimestamps.set(filePath, new Date());
    }),
    stat: vi.fn(async (filePath: string) => {
      const content = getNestedValue(filesystem, filePath);
      if (content !== undefined) {
        const isDir = typeof content === 'object';
        return {
          mtime: fileTimestamps.get(filePath) || new Date(),
          isDirectory: () => isDir,
          isFile: () => !isDir
        };
      }
      throw new Error('File not found: ' + filePath);
    })
  }
}));

describe('json format', () => {
  function createCompiler() {
    return new ExtractionCompiler(
      {
        srcPath: './src',
        sourceLocale: 'en',
        messages: {
          path: './messages',
          format: 'json',
          locales: 'infer'
        }
      },
      {
        isDevelopment: true,
        projectRoot: '/project'
      }
    );
  }

  it('saves messages initially', {timeout: 10000}, async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hey!')}</div>;
    }
    `;
    filesystem.project.messages = {
      'en.json': '{"+YJVTi": "Hey!"}',
      'de.json': '{"+YJVTi": "Hallo!"}'
    };

    using compiler = createCompiler();
    await compiler.extractAll();

    await waitForWriteFileCalls(2);
    expect(vi.mocked(fs.writeFile).mock.calls).toMatchInlineSnapshot(`
      [
        [
          "messages/en.json",
          "{
        "+YJVTi": "Hey!"
      }
      ",
        ],
        [
          "messages/de.json",
          "{
        "+YJVTi": "Hallo!"
      }
      ",
        ],
      ]
    `);
  });
});

describe('po format', () => {
  function createCompiler() {
    return new ExtractionCompiler(
      {
        srcPath: './src',
        sourceLocale: 'en',
        messages: {
          path: './messages',
          format: 'po',
          locales: 'infer'
        }
      },
      {
        isDevelopment: true,
        projectRoot: '/project'
      }
    );
  }

  it('normalizes Windows path separators in references', async () => {
    filesystem.project.src['Greeting.tsx'] =
      `import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hey!')}</div>;
    }
    `;
    filesystem.project.messages = {};

    using relativeSpy = (() => {
      const originalRelative = path.relative;
      const spy = vi.spyOn(path, 'relative').mockImplementation((from, to) => {
        if (from === '/project' && to === '/project/src/Greeting.tsx') {
          return 'src\\Greeting.tsx';
        }
        return originalRelative(from, to);
      });

      (spy as typeof spy & {[Symbol.dispose](): void})[Symbol.dispose] =
        function restoreRelativeSpy() {
          spy.mockRestore();
        };

      return spy as typeof spy & {[Symbol.dispose](): void};
    })();

    using compiler = createCompiler();
    await compiler.extractAll();
    await waitForWriteFileCalls(1);
    const output = vi.mocked(fs.writeFile).mock.calls[0][1] as string;

    expect(output).toContain('#: src/Greeting.tsx:4');
    expect(output).not.toContain('src\\Greeting.tsx');
    expect(relativeSpy).toHaveBeenCalled();
  });

  it('saves messages initially', async () => {
    filesystem.project.src['Greeting.tsx'] =
      `import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hey!')}</div>;
    }
    `;
    filesystem.project.messages = {
      'en.po': `
      #: src/Greeting.tsx:4
      msgid "+YJVTi"
      msgstr "Hey!"
      `,
      'de.po': `
      #: src/Greeting.tsx:4
      msgid "+YJVTi"
      msgstr "Hallo!"
      `
    };

    using compiler = createCompiler();
    await compiler.extractAll();
    expect(vi.mocked(fs.writeFile).mock.calls).toMatchInlineSnapshot(`
      [
        [
          "messages/en.po",
          "msgid ""
      msgstr ""
      "Language: en\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: next-intl\\n"
      "X-Crowdin-SourceKey: msgstr\\n"

      #: src/Greeting.tsx:4
      msgid "+YJVTi"
      msgstr "Hey!"
      ",
        ],
        [
          "messages/de.po",
          "msgid ""
      msgstr ""
      "Language: de\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: next-intl\\n"
      "X-Crowdin-SourceKey: msgstr\\n"

      #: src/Greeting.tsx:4
      msgid "+YJVTi"
      msgstr "Hallo!"
      ",
        ],
      ]
    `);
  });
});

describe('custom format', () => {
  it('supports a structured json custom format with codecs', async () => {
    filesystem.project.messages = {
      'en.json': JSON.stringify(
        {
          'ui.wESdnU': {message: 'Click me', description: 'Button label'}
        },
        null,
        2
      )
    };
    filesystem.project.src['Button.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Button() {
      const t = useExtracted('ui');
      return (
        <button>
          {t({message: 'Click me', description: 'Button label'})}
          {t('Submit')}
        </button>
      );
    }
    `;

    using compiler = new ExtractionCompiler(
      {
        srcPath: './src',
        sourceLocale: 'en',
        messages: {
          path: './messages',
          format: {
            codec: path.resolve(
              __dirname,
              'format/codecs/fixtures/JSONCodecStructured.tsx'
            ),
            extension: '.json'
          },
          locales: 'infer'
        }
      },
      {
        isDevelopment: true,
        projectRoot: '/project'
      }
    );

    await compiler.extractAll();
    await waitForWriteFileCalls(1);

    expect(vi.mocked(fs.writeFile).mock.calls).toMatchInlineSnapshot(`
      [
        [
          "messages/en.json",
          "{
        "ui.wESdnU": {
          "message": "Click me",
          "description": "Button label"
        },
        "ui.wSZR47": {
          "message": "Submit"
        }
      }
      ",
        ],
      ]
    `);
  });

  it('supports a custom PO format that uses source messages as msgid', async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hello!')}</div>;
    }
    `;
    filesystem.project.messages = {
      'en.po': `
      #: src/Greeting.tsx
      msgctxt "OpKKos"
      msgid "Hello!"
      msgstr "Hello!"
      `,
      'de.po': `
      #: src/Greeting.tsx
      msgctxt "OpKKos"
      msgid "Hello!"
      msgstr "Hallo!"
      `
    };

    using compiler = new ExtractionCompiler(
      {
        srcPath: './src',
        sourceLocale: 'en',
        messages: {
          path: './messages',
          format: {
            codec: path.resolve(
              __dirname,
              'format/codecs/fixtures/POCodecSourceMessageKey.tsx'
            ),
            extension: '.po'
          },
          locales: 'infer'
        }
      },
      {
        isDevelopment: true,
        projectRoot: '/project'
      }
    );

    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hello!')}</div>;
    }
    function Error() {
      const t = useExtracted('misc');
      return (
        <div>
          {t('The code you entered is incorrect. Please try again or contact support@example.com.')}
          {t("Checking if you're logged in.")}
        </div>
      );
    }
    `;

    await compiler.extractAll();

    await waitForWriteFileCalls(2);
    expect(vi.mocked(fs.writeFile).mock.calls).toMatchInlineSnapshot(`
      [
        [
          "messages/en.po",
          "msgid ""
      msgstr ""
      "Language: en\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: next-intl\\n"

      #: src/Greeting.tsx:5
      msgctxt "OpKKos"
      msgid "Hello!"
      msgstr "Hello!"

      #: src/Greeting.tsx:11
      msgctxt "misc.l6ZjWT"
      msgid "The code you entered is incorrect. Please try again or contact support@example.com."
      msgstr "The code you entered is incorrect. Please try again or contact support@example.com."

      #: src/Greeting.tsx:12
      msgctxt "misc.Fp6Fab"
      msgid "Checking if you're logged in."
      msgstr "Checking if you're logged in."
      ",
        ],
        [
          "messages/de.po",
          "msgid ""
      msgstr ""
      "Language: de\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: next-intl\\n"

      #: src/Greeting.tsx:5
      msgctxt "OpKKos"
      msgid "Hello!"
      msgstr "Hallo!"

      #: src/Greeting.tsx:11
      msgctxt "misc.l6ZjWT"
      msgid "The code you entered is incorrect. Please try again or contact support@example.com."
      msgstr ""

      #: src/Greeting.tsx:12
      msgctxt "misc.Fp6Fab"
      msgid "Checking if you're logged in."
      msgstr ""
      ",
        ],
      ]
    `);
  });
});

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
  vi.clearAllMocks();
});

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
      {isDevelopment: true, projectRoot: '/project'}
    );
  }

  it('saves messages initially', async () => {
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

    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );

    // Wait for at least 2 writes (might save more due to change detection)
    await waitForWriteFileCalls(2, {atLeast: true});
    expect(filesystem.project.messages).toMatchInlineSnapshot(`
      {
        "de.json": "{
        "+YJVTi": "Hallo!"
      }
      ",
        "en.json": "{
        "+YJVTi": "Hey!"
      }
      ",
      }
    `);
  });

  it('resets translations when a message changes', async () => {
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

    await compiler.compile(
      '/project/src/Greeting.tsx',
      `
      import {useExtracted} from 'next-intl';
      function Greeting() {
        const t = useExtracted();
        return <div>{t('Hello!')}</div>;
      }
      `
    );

    // Wait for writes to settle (exact count may vary)
    await waitForWriteFileCalls(4, {atLeast: true});

    // Check final state
    expect(filesystem.project.messages).toMatchInlineSnapshot(`
      {
        "de.json": "{
        "OpKKos": ""
      }
      ",
        "en.json": "{
        "OpKKos": "Hello!"
      }
      ",
      }
    `);
  });

  it('removes translations when all messages are removed from a file', async () => {
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

    await compiler.compile(
      '/project/src/Greeting.tsx',
      `
      function Greeting() {
        return <div />;
      }
    `
    );

    await waitForWriteFileCalls(4);

    expect(vi.mocked(fs.writeFile).mock.calls.slice(2)).toMatchInlineSnapshot(`
      [
        [
          "messages/en.json",
          "{}
      ",
        ],
        [
          "messages/de.json",
          "{}
      ",
        ],
      ]
    `);
  });

  it('restores previous translations when messages are added back', async () => {
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

    await compiler.compile(
      '/project/src/Greeting.tsx',
      `
      function Greeting() {
        return <div />;
      }
    `
    );

    await waitForWriteFileCalls(4);

    expect(vi.mocked(fs.writeFile).mock.calls.slice(2)).toMatchInlineSnapshot(`
      [
        [
          "messages/en.json",
          "{}
      ",
        ],
        [
          "messages/de.json",
          "{}
      ",
        ],
      ]
    `);

    await compiler.compile(
      '/project/src/Greeting.tsx',
      `
      import {useExtracted} from 'next-intl';
      function Greeting() {
        const t = useExtracted();
        return <div>{t('Hey!')}</div>;
      }
    `
    );

    await waitForWriteFileCalls(6);

    expect(vi.mocked(fs.writeFile).mock.calls.slice(4)).toMatchInlineSnapshot(`
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

  it('handles namespaces when storing messages', async () => {
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

    await compiler.compile(
      '/project/src/Greeting.tsx',
      `
      import {useExtracted} from 'next-intl';
      function Greeting() {
        const t = useExtracted('ui');
        return <div>{t('Hello!')}</div>;
      }
      `
    );

    await waitForWriteFileCalls(4);

    expect(vi.mocked(fs.writeFile).mock.calls.slice(2)).toMatchInlineSnapshot(`
      [
        [
          "messages/en.json",
          "{
        "ui": {
          "OpKKos": "Hello!"
        }
      }
      ",
        ],
        [
          "messages/de.json",
          "{
        "ui": {
          "OpKKos": ""
        }
      }
      ",
        ],
      ]
    `);
  });

  it('preserves manual translations in target catalogs when adding new messages', async () => {
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

    await compiler.compile(
      '/project/src/Greeting.tsx',
      `
      import {useExtracted} from 'next-intl';
      function Greeting() {
        const t = useExtracted();
        return <div>{t('Hello!')}</div>;
      }
      `
    );
    expect(filesystem).toMatchInlineSnapshot(`
      {
        "project": {
          "messages": {
            "de.json": "{
        "+YJVTi": "Hallo!"
      }
      ",
            "en.json": "{
        "+YJVTi": "Hey!"
      }
      ",
          },
          "src": {
            "Greeting.tsx": "
          import {useExtracted} from 'next-intl';
          function Greeting() {
            const t = useExtracted();
            return <div>{t('Hey!')}</div>;
          }
          ",
          },
        },
      }
    `);

    simulateManualFileEdit(
      'messages/de.json',
      JSON.stringify({OpKKos: 'Hallo!'})
    );
    await compiler.compile(
      '/project/src/Greeting.tsx',
      `
      import {useExtracted} from 'next-intl';
      function Greeting() {
        const t = useExtracted();
        return <div>{t('Hello!')} {t('Goodbye!')}</div>;
      }
      `
    );

    await waitForWriteFileCalls(6);
    expect(filesystem.project.messages).toMatchInlineSnapshot(`
      {
        "de.json": "{
        "NnE1NP": "",
        "OpKKos": "Hallo!"
      }
      ",
        "en.json": "{
        "NnE1NP": "Goodbye!",
        "OpKKos": "Hello!"
      }
      ",
      }
    `);
  });

  it('preserves messages when removed from one file but still used in another', async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hey!')}</div>;
    }
    `;
    filesystem.project.src['Footer.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Footer() {
      const t = useExtracted();
      return <div>{t('Hey!')}</div>;
    }
    `;
    filesystem.project.messages = {
      'en.json': '{"+YJVTi": "Hey!"}',
      'de.json': '{"+YJVTi": "Hallo!"}'
    };

    using compiler = createCompiler();

    // Kick off compilation
    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );
    await waitForWriteFileCalls(2);

    // Remove message from one file
    await compiler.compile(
      '/project/src/Greeting.tsx',
      `
      function Greeting() {
        return <div />;
      }
    `
    );

    await sleep(100);

    // Note: We write even though catalog content is unchanged because
    // Greeting.tsx's messages changed (1→0). The message persists from
    // Footer.tsx, so output is identical - this is acceptable overhead.
    // (For .po format, references would actually change, so writing is needed there.)
    await waitForWriteFileCalls(4);

    expect(vi.mocked(fs.writeFile).mock.calls.slice(-2)).toMatchInlineSnapshot(`
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

  it('creates the messages directory and source catalog when they do not exist initially', async () => {
    filesystem.project.messages = undefined;
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hey!')}</div>;
    }
    `;

    using compiler = createCompiler();

    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );

    expect(vi.mocked(fs.mkdir)).toHaveBeenCalledWith('messages', {
      recursive: true
    });
    expect(vi.mocked(fs.writeFile)).toHaveBeenCalledWith(
      'messages/en.json',
      expect.any(String)
    );
    expect(JSON.parse(filesystem.project.messages!['en.json'])).toEqual({
      '+YJVTi': 'Hey!'
    });
  });

  it('writes to newly added catalog file', async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hello!')}</div>;
    }
    `;
    filesystem.project.messages = {
      'en.json': '{"OpKKos": "Hello!"}'
    };

    using compiler = createCompiler();
    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );

    await waitForWriteFileCalls(1);

    filesystem.project.messages!['de.json'] = '{}';
    simulateFileEvent('/project/messages', 'rename', 'de.json');

    await vi.waitFor(
      () => {
        const calls = vi.mocked(fs.writeFile).mock.calls;
        expect(calls.find((cur) => cur[0] === 'messages/de.json')).toEqual([
          'messages/de.json',
          '{\n  "OpKKos": ""\n}\n'
        ]);
      },
      {timeout: 500}
    );
  });

  it('preserves existing translations when adding a catalog file', async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hello!')}</div>;
    }
    `;
    filesystem.project.messages = {
      'en.json': '{"OpKKos": "Hello!"}'
    };

    using compiler = createCompiler();
    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );

    await waitForWriteFileCalls(1);

    filesystem.project.messages!['de.json'] = '{"OpKKos": "Hallo!"}';
    simulateFileEvent('/project/messages', 'rename', 'de.json');

    await vi.waitFor(
      () => {
        const calls = vi.mocked(fs.writeFile).mock.calls;
        expect(calls.find((cur) => cur[0] === 'messages/de.json')).toEqual([
          'messages/de.json',
          '{\n  "OpKKos": "Hallo!"\n}\n'
        ]);
      },
      {timeout: 500}
    );

    // vi.mocked(fs.writeFile).mockClear();

    await compiler.compile(
      '/project/src/Greeting.tsx',
      `
      import {useExtracted} from 'next-intl';
      function Greeting() {
        const t = useExtracted();
        return <div>{t('Hello!')} {t('World!')}</div>;
      }
    `
    );

    await waitForWriteFileCalls(4);

    expect(vi.mocked(fs.writeFile).mock.calls.slice(3)).toMatchInlineSnapshot(`
      [
        [
          "messages/de.json",
          "{
        "7kKG3Q": "",
        "OpKKos": "Hallo!"
      }
      ",
        ],
      ]
    `);
  });

  it('stops writing to removed catalog file', async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hello!')}</div>;
    }
    `;
    filesystem.project.messages = {
      'en.json': '{"OpKKos": "Hello!"}',
      'de.json': '{"OpKKos": "Hallo!"}',
      'fr.json': '{"OpKKos": "Bonjour!"}'
    };

    using compiler = createCompiler();
    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );

    await waitForWriteFileCalls(3);

    delete filesystem.project.messages!['fr.json'];
    simulateFileEvent('/project/messages', 'rename', 'fr.json');

    await compiler.compile(
      '/project/src/Greeting.tsx',
      `
      import {useExtracted} from 'next-intl';
      function Greeting() {
        const t = useExtracted();
        return <div>{t('Hello!')} {t('Goodbye!')}</div>;
      }
      `
    );

    await waitForWriteFileCalls(5);

    expect(vi.mocked(fs.writeFile).mock.calls.slice(3)).toMatchInlineSnapshot(`
      [
        [
          "messages/en.json",
          "{
        "NnE1NP": "Goodbye!",
        "OpKKos": "Hello!"
      }
      ",
        ],
        [
          "messages/de.json",
          "{
        "NnE1NP": "",
        "OpKKos": "Hallo!"
      }
      ",
        ],
      ]
    `);
  });

  it('creates all locale files immediately when explicit locales are provided', async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hello!')}</div>;
    }
    `;
    filesystem.project.messages = undefined;

    using compiler = new ExtractionCompiler(
      {
        srcPath: './src',
        sourceLocale: 'en',
        messages: {
          path: './messages',
          format: 'json',
          locales: ['de', 'fr']
        }
      },
      {isDevelopment: true, projectRoot: '/project'}
    );

    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );

    await waitForWriteFileCalls(3);

    expect(vi.mocked(fs.writeFile).mock.calls).toMatchInlineSnapshot(`
      [
        [
          "messages/en.json",
          "{
        "OpKKos": "Hello!"
      }
      ",
        ],
        [
          "messages/de.json",
          "{
        "OpKKos": ""
      }
      ",
        ],
        [
          "messages/fr.json",
          "{
        "OpKKos": ""
      }
      ",
        ],
      ]
    `);

    expect(watchCallbacks.size).toBe(0);
  });

  it('initializes all messages to empty string when adding new catalog', async () => {
    filesystem.project.messages = undefined;
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hello!')} {t('World!')}</div>;
    }
    `;

    using compiler = createCompiler();

    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );

    await waitForWriteFileCalls(1);

    expect(JSON.parse(filesystem.project.messages!['en.json']))
      .toMatchInlineSnapshot(`
        {
          "7kKG3Q": "World!",
          "OpKKos": "Hello!",
        }
      `);

    filesystem.project.messages!['de.json'] = '{}';
    simulateFileEvent('/project/messages', 'rename', 'de.json');

    await waitForWriteFileCalls(2);
    expect(vi.mocked(fs.writeFile).mock.calls.at(-1)).toMatchInlineSnapshot(`
      [
        "messages/de.json",
        "{
        "7kKG3Q": "",
        "OpKKos": ""
      }
      ",
      ]
    `);
  });

  it('avoids a race condition when compiling while a new locale is added', async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hello!')}</div>;
    }
    `;
    filesystem.project.messages = {
      'en.json': '{"OpKKos": "Hello!"}'
    };

    using compiler = createCompiler();
    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );

    // Prepare the new locale file
    filesystem.project.messages!['fr.json'] = '{"OpKKos": "Bonjour!"}';

    let resolveReadFile: (() => void) | undefined;
    const readFilePromise = new Promise<void>((resolve) => {
      resolveReadFile = resolve;
    });

    // Intercept reading of fr.json
    readFileInterceptors.set('fr.json', () => readFilePromise);

    // Trigger the file change (this starts the loading process)
    simulateFileEvent('/project/messages', 'rename', 'fr.json');

    // While loading is pending (stuck in readFile), trigger a compile/save
    // We change the content to ensure `save()` is actually called
    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx'] +
        `
        function Other() {
          const t = useExtracted();
          return <div>{t('Hi!')}</div>;
        }`
    );

    // Wait for the async operations to settle. We need to ensure the "bad save"
    // attempt happens while the read interceptor is still blocking the load.
    await sleep(100);

    // Allow loading to finish
    resolveReadFile?.();

    // Wait for everything to settle
    await sleep(100);

    // Ensure only the new message is empty
    expect(JSON.parse(filesystem.project.messages!['fr.json'])).toEqual({
      OpKKos: 'Bonjour!',
      'nm/7yQ': ''
    });
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
      {isDevelopment: true, projectRoot: '/project'}
    );
  }

  it('saves messages initially', async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
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

    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );
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

      #: src/Greeting.tsx
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

      #: src/Greeting.tsx
      msgid "+YJVTi"
      msgstr "Hallo!"
      ",
        ],
      ]
    `);
  });

  it('saves changes to descriptions', async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
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

    await compiler.compile(
      '/project/src/Greeting.tsx',
      `
      import {useExtracted} from 'next-intl';
      function Greeting() {
        const t = useExtracted();
        return <div>{t({
          message: 'Hey!',
          description: 'Shown on home screen'
        })}</div>;
      }
      `
    );
    await waitForWriteFileCalls(4);
    expect(vi.mocked(fs.writeFile).mock.calls.slice(2)).toMatchInlineSnapshot(`
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

      #. Shown on home screen
      #: src/Greeting.tsx
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

      #. Shown on home screen
      #: src/Greeting.tsx
      msgid "+YJVTi"
      msgstr "Hallo!"
      ",
        ],
      ]
    `);
  });

  it('combines references from multiple files', async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
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

    await compiler.compile(
      '/project/src/Footer.tsx',
      `
      import {useExtracted} from 'next-intl';
      function Footer() {
        const t = useExtracted();
        return <div>{t('Hey!')}</div>;
      }
      `
    );

    await waitForWriteFileCalls(4);

    expect(vi.mocked(fs.writeFile).mock.calls.slice(2)).toMatchInlineSnapshot(`
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

      #: src/Footer.tsx
      #: src/Greeting.tsx
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

      #: src/Footer.tsx
      #: src/Greeting.tsx
      msgid "+YJVTi"
      msgstr "Hallo!"
      ",
        ],
      ]
    `);
  });

  it('updates references in all catalogs when message is reused in another file', async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hey!')}</div>;
    }
    `;
    filesystem.project.messages = {
      'en.po': '',
      'de.po': ''
    };

    using compiler = createCompiler();

    // First compile: only Greeting.tsx has the message
    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );
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
      "X-Crowdin-SourceKey: msgstr\\n"

      #: src/Greeting.tsx
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

      #: src/Greeting.tsx
      msgid "+YJVTi"
      msgstr ""
      ",
        ],
      ]
    `);

    // Second compile: Footer.tsx also uses the same message
    await compiler.compile(
      '/project/src/Footer.tsx',
      `
      import {useExtracted} from 'next-intl';
      function Footer() {
        const t = useExtracted();
        return <div>{t('Hey!')}</div>;
      }
      `
    );
    await waitForWriteFileCalls(4);

    expect(vi.mocked(fs.writeFile).mock.calls.slice(2)).toMatchInlineSnapshot(`
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

      #: src/Footer.tsx
      #: src/Greeting.tsx
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

      #: src/Footer.tsx
      #: src/Greeting.tsx
      msgid "+YJVTi"
      msgstr ""
      ",
        ],
      ]
    `);
  });

  it('supports namespaces', async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted('ui');
      return <div>{t('Hello!')}</div>;
    }
    `;

    using compiler = createCompiler();

    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );

    await waitForWriteFileCalls(1);
    expect(vi.mocked(fs.writeFile).mock.calls[0]).toMatchInlineSnapshot(`
      [
        "messages/en.po",
        "msgid ""
      msgstr ""
      "Language: en\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: next-intl\\n"
      "X-Crowdin-SourceKey: msgstr\\n"

      #: src/Greeting.tsx
      msgctxt "ui"
      msgid "OpKKos"
      msgstr "Hello!"
      ",
      ]
    `);
  });

  it('retains metadata when saving back to file', async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hey!')}</div>;
    }
    `;
    filesystem.project.messages = {
      'en.po': `msgid ""
msgstr ""
"POT-Creation-Date: 2025-10-27 16:00+0000\n"
"MIME-Version: 1.0\n"
"Content-Type: text/plain; charset=UTF-8\n"
"X-Generator: some-po-editor\n"
"X-Something-Else: test\n"
"Language: en\n"

#: src/Greeting.tsx:4
msgid "+YJVTi"
msgstr "Hey!"
`,
      'de.po': `msgid ""
msgstr ""
"POT-Creation-Date: 2025-10-27 16:00+0000\n"
"Content-Type: text/plain; charset=UTF-8\n"
"Language: de\n"

#: src/Greeting.tsx:4
msgid "+YJVTi"
msgstr "Hallo!"
`
    };

    using compiler = createCompiler();

    await compiler.compile(
      '/project/src/Greeting.tsx',
      `
      import {useExtracted} from 'next-intl';
      function Greeting() {
        const t = useExtracted();
        return <div>{t('Hello!')}</div>;
      }
      `
    );

    await waitForWriteFileCalls(4);
    expect(vi.mocked(fs.writeFile).mock.calls.slice(2)).toMatchInlineSnapshot(`
      [
        [
          "messages/en.po",
          "msgid ""
      msgstr ""
      "Language: en\\n"
      "Content-Type: text/plain; charset=UTF-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: some-po-editor\\n"
      "X-Crowdin-SourceKey: msgstr\\n"
      "POT-Creation-Date: 2025-10-27 16:00+0000\\n"
      "MIME-Version: 1.0\\n"
      "X-Something-Else: test\\n"

      #: src/Greeting.tsx
      msgid "OpKKos"
      msgstr "Hello!"
      ",
        ],
        [
          "messages/de.po",
          "msgid ""
      msgstr ""
      "Language: de\\n"
      "Content-Type: text/plain; charset=UTF-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: next-intl\\n"
      "X-Crowdin-SourceKey: msgstr\\n"
      "POT-Creation-Date: 2025-10-27 16:00+0000\\n"

      #: src/Greeting.tsx
      msgid "OpKKos"
      msgstr ""
      ",
        ],
      ]
    `);
  });

  it('sorts messages by reference path', async () => {
    using compiler = createCompiler();

    await compiler.compile(
      '/project/src/components/Header.tsx',
      `
    import {useExtracted} from 'next-intl';
    export default function Header() {
      const t = useExtracted();
      return <div>{t('Welcome')}</div>;
    }
    `
    );

    await compiler.compile(
      '/project/src/app/page.tsx',
      `
    import {useExtracted} from 'next-intl';
    export default function Page() {
      const t = useExtracted();
      return <div>{t('Hello')}</div>;
    }
    `
    );

    await waitForWriteFileCalls(3);

    expect(vi.mocked(fs.writeFile).mock.calls.at(-1)).toMatchInlineSnapshot(`
      [
        "messages/en.po",
        "msgid ""
      msgstr ""
      "Language: en\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: next-intl\\n"
      "X-Crowdin-SourceKey: msgstr\\n"

      #: src/app/page.tsx
      msgid "NhX4DJ"
      msgstr "Hello"

      #: src/components/Header.tsx
      msgid "PwaN2o"
      msgstr "Welcome"
      ",
      ]
    `);
  });

  it('sorts messages by reference path when files are compiled out of order', async () => {
    using compiler = createCompiler();

    await compiler.compile(
      '/project/src/a.tsx',
      `
    import {useExtracted} from 'next-intl';
    export default function A() {
      const t = useExtracted();
      return <div>{t('Message A')}</div>;
    }
    `
    );

    await compiler.compile(
      '/project/src/d.tsx',
      `
    import {useExtracted} from 'next-intl';
    export default function D() {
      const t = useExtracted();
      return <div>{t('Message B')}</div>;
    }
    `
    );

    await compiler.compile(
      '/project/src/c.tsx',
      `
    import {useExtracted} from 'next-intl';
    export default function C() {
      const t = useExtracted();
      return <div>{t('Message C')}</div>;
    }
    `
    );

    await compiler.compile(
      '/project/src/b.tsx',
      `
    import {useExtracted} from 'next-intl';
    export default function B() {
      const t = useExtracted();
      return <div>{t('Message B')}</div>;
    }
    `
    );

    await waitForWriteFileCalls(5);

    expect(vi.mocked(fs.writeFile).mock.calls.at(-1)).toMatchInlineSnapshot(`
      [
        "messages/en.po",
        "msgid ""
      msgstr ""
      "Language: en\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: next-intl\\n"
      "X-Crowdin-SourceKey: msgstr\\n"

      #: src/a.tsx
      msgid "PmvAXH"
      msgstr "Message A"

      #: src/b.tsx
      #: src/d.tsx
      msgid "5bb321"
      msgstr "Message B"

      #: src/c.tsx
      msgid "c3UbA2"
      msgstr "Message C"
      ",
      ]
    `);
  });

  it('initializes all messages to empty string when adding new catalog', async () => {
    filesystem.project.messages = undefined;
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hello!')} {t('World!')}</div>;
    }
    `;

    using compiler = createCompiler();

    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );

    await waitForWriteFileCalls(1);

    filesystem.project.messages!['de.po'] = '';
    simulateFileEvent('/project/messages', 'rename', 'de.po');

    await waitForWriteFileCalls(2);
    expect(vi.mocked(fs.writeFile).mock.calls.slice(1)).toMatchInlineSnapshot(`
      [
        [
          "messages/de.po",
          "msgid ""
      msgstr ""
      "Language: de\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: next-intl\\n"
      "X-Crowdin-SourceKey: msgstr\\n"

      #: src/Greeting.tsx
      msgid "7kKG3Q"
      msgstr ""

      #: src/Greeting.tsx
      msgid "OpKKos"
      msgstr ""
      ",
        ],
      ]
    `);
  });

  it('preserves flags', async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hey!')}</div>;
    }
    `;
    filesystem.project.messages = {
      'en.po': `
      #: src/Greeting.tsx:4
      #, fuzzy
      msgid "+YJVTi"
      msgstr "Hey!"
      `,
      'de.po': `
      #: src/Greeting.tsx:4
      #, c-format
      msgid "+YJVTi"
      msgstr "Hallo!"
      `
    };

    using compiler = createCompiler();

    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );

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
      "X-Crowdin-SourceKey: msgstr\\n"

      #: src/Greeting.tsx
      #, fuzzy
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

      #: src/Greeting.tsx
      #, c-format
      msgid "+YJVTi"
      msgstr "Hallo!"
      ",
        ],
      ]
    `);
  });

  it('removes flags when externally deleted', async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hey!')}</div>;
    }
    `;
    filesystem.project.messages = {
      'en.po': `
      #: src/Greeting.tsx
      #, fuzzy, c-format
      msgid "+YJVTi"
      msgstr "Hey!"
      `,
      'de.po': `
      #: src/Greeting.tsx
      #, fuzzy, no-wrap
      msgid "+YJVTi"
      msgstr "Hallo!"
      `
    };

    using compiler = createCompiler();

    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );

    await waitForWriteFileCalls(2);

    // Remove fuzzy flag from source locale, keep c-format
    simulateManualFileEdit(
      'messages/en.po',
      `msgid ""
msgstr ""
"Language: en\\n"

#: src/Greeting.tsx
#, c-format
msgid "+YJVTi"
msgstr "Hey!"
`
    );

    // Trigger recompile with source change
    await compiler.compile(
      '/project/src/Greeting.tsx',
      `
      import {useExtracted} from 'next-intl';
      function Greeting() {
        const t = useExtracted();
        return <div>{t('Hey!')} {t('World')}</div>;
      }
      `
    );

    await waitForWriteFileCalls(4);
    expect(
      vi
        .mocked(fs.writeFile)
        .mock.calls.filter((call) => call[0] === 'messages/en.po')
        .at(-1)
    ).toMatchInlineSnapshot(`
      [
        "messages/en.po",
        "msgid ""
      msgstr ""
      "Language: en\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: next-intl\\n"
      "X-Crowdin-SourceKey: msgstr\\n"

      #: src/Greeting.tsx
      #, c-format
      msgid "+YJVTi"
      msgstr "Hey!"

      #: src/Greeting.tsx
      msgid "jqdzk6"
      msgstr "World"
      ",
      ]
    `);

    // Remove remaining c-format flag from source locale
    simulateManualFileEdit(
      'messages/en.po',
      `msgid ""
msgstr ""
"Language: en\\n"

#: src/Greeting.tsx
msgid "+YJVTi"
msgstr "Hey!"

#: src/Greeting.tsx
msgid "sJM+Xd"
msgstr "World"
`
    );

    await compiler.compile(
      '/project/src/Greeting.tsx',
      `
      import {useExtracted} from 'next-intl';
      function Greeting() {
        const t = useExtracted();
        return <div>{t('Hey!')} {t('World')} {t('!')}</div>;
      }
      `
    );

    await waitForWriteFileCalls(6);
    expect(
      vi
        .mocked(fs.writeFile)
        .mock.calls.filter((call) => call[0] === 'messages/en.po')
        .at(-1)
    ).toMatchInlineSnapshot(`
      [
        "messages/en.po",
        "msgid ""
      msgstr ""
      "Language: en\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: next-intl\\n"
      "X-Crowdin-SourceKey: msgstr\\n"

      #: src/Greeting.tsx
      msgid "+YJVTi"
      msgstr "Hey!"

      #: src/Greeting.tsx
      msgid "jqdzk6"
      msgstr "World"

      #: src/Greeting.tsx
      msgid "ODGmph"
      msgstr "!"
      ",
      ]
    `);

    // Now remove flags from target locale (remove fuzzy, keep no-wrap)
    simulateManualFileEdit(
      'messages/de.po',
      `msgid ""
msgstr ""
"Language: de\\n"

#: src/Greeting.tsx
#, no-wrap
msgid "+YJVTi"
msgstr "Hallo!"

#: src/Greeting.tsx
msgid "sJM+Xd"
msgstr ""

#: src/Greeting.tsx
msgid "eCfPKC"
msgstr ""
`
    );

    await compiler.compile(
      '/project/src/Greeting.tsx',
      `
      import {useExtracted} from 'next-intl';
      function Greeting() {
        const t = useExtracted();
        return <div>{t('Hey!')} {t('World')} {t('!')} {t('Extra')}</div>;
      }
      `
    );

    await waitForWriteFileCalls(8);
    expect(
      vi
        .mocked(fs.writeFile)
        .mock.calls.filter((call) => call[0] === 'messages/de.po')
        .at(-1)
    ).toMatchInlineSnapshot(`
      [
        "messages/de.po",
        "msgid ""
      msgstr ""
      "Language: de\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: next-intl\\n"
      "X-Crowdin-SourceKey: msgstr\\n"

      #: src/Greeting.tsx
      #, no-wrap
      msgid "+YJVTi"
      msgstr "Hallo!"

      #: src/Greeting.tsx
      msgid "jqdzk6"
      msgstr ""

      #: src/Greeting.tsx
      msgid "ODGmph"
      msgstr ""

      #: src/Greeting.tsx
      msgid "pE58D7"
      msgstr ""
      ",
      ]
    `);

    // Remove all flags from target locale
    simulateManualFileEdit(
      'messages/de.po',
      `msgid ""
msgstr ""
"Language: de\\n"

#: src/Greeting.tsx
msgid "+YJVTi"
msgstr "Hallo!"

#: src/Greeting.tsx
msgid "+tjj/T"
msgstr ""

#: src/Greeting.tsx
msgid "eCfPKC"
msgstr ""

#: src/Greeting.tsx
msgid "sJM+Xd"
msgstr ""
`
    );

    await compiler.compile(
      '/project/src/Greeting.tsx',
      `
      import {useExtracted} from 'next-intl';
      function Greeting() {
        const t = useExtracted();
        return <div>{t('Hey!')} {t('World')} {t('!')} {t('Extra')} {t('More')}</div>;
      }
      `
    );

    await waitForWriteFileCalls(10);
    expect(
      vi
        .mocked(fs.writeFile)
        .mock.calls.filter((call) => call[0] === 'messages/de.po')
        .at(-1)
    ).toMatchInlineSnapshot(`
      [
        "messages/de.po",
        "msgid ""
      msgstr ""
      "Language: de\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: next-intl\\n"
      "X-Crowdin-SourceKey: msgstr\\n"

      #: src/Greeting.tsx
      msgid "+YJVTi"
      msgstr "Hallo!"

      #: src/Greeting.tsx
      msgid "I5NMJ8"
      msgstr ""

      #: src/Greeting.tsx
      msgid "jqdzk6"
      msgstr ""

      #: src/Greeting.tsx
      msgid "ODGmph"
      msgstr ""

      #: src/Greeting.tsx
      msgid "pE58D7"
      msgstr ""
      ",
      ]
    `);
  });

  it('preserves manually added flags in source locale after recompile', async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hey!')}</div>;
    }
    `;
    filesystem.project.messages = {
      'en.po': `
      #: src/Greeting.tsx
      msgid "+YJVTi"
      msgstr "Hey!"
      `
    };

    using compiler = createCompiler();

    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );

    await waitForWriteFileCalls(1);

    simulateManualFileEdit(
      'messages/en.po',
      `msgid ""
msgstr ""
"Language: en\\n"

#: src/Greeting.tsx
#, fuzzy
msgid "+YJVTi"
msgstr "Hey!"
`
    );

    await compiler.compile(
      '/project/src/Greeting.tsx',
      `
      import {useExtracted} from 'next-intl';
      function Greeting() {
        const t = useExtracted();
        return <div>{t('Hey!')} {t('World!')}</div>;
      }
      `
    );

    await waitForWriteFileCalls(2);
    expect(vi.mocked(fs.writeFile).mock.calls.at(-1)).toMatchInlineSnapshot(`
      [
        "messages/en.po",
        "msgid ""
      msgstr ""
      "Language: en\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: next-intl\\n"
      "X-Crowdin-SourceKey: msgstr\\n"

      #: src/Greeting.tsx
      #, fuzzy
      msgid "+YJVTi"
      msgstr "Hey!"

      #: src/Greeting.tsx
      msgid "7kKG3Q"
      msgstr "World!"
      ",
      ]
    `);
  });

  it('avoids a race condition when saving while loading locale catalogs with metadata', async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hello!')}</div>;
    }
    `;
    filesystem.project.messages = {
      'en.po': `
      #: src/Greeting.tsx:4
      #, c-format
      #. This is a description
      msgid "OpKKos"
      msgstr "Hello!"
      `,
      'de.po': `
      #: src/Greeting.tsx:4
      #, fuzzy
      #. This is a description
      msgid "OpKKos"
      msgstr "Hallo!"
      `
    };

    using compiler = createCompiler();
    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );

    let resolveReadFile: (() => void) | undefined;
    const readFilePromise = new Promise<void>((resolve) => {
      resolveReadFile = resolve;
    });

    readFileInterceptors.set('de.po', () => readFilePromise);
    readFileInterceptors.set('en.po', () => readFilePromise);

    simulateFileEvent('/project/messages', 'rename', 'de.po');
    simulateFileEvent('/project/messages', 'rename', 'en.po');

    // Wait a bit to ensure onLocalesChange has started and created the reload promise
    await sleep(50);

    // While loading is pending (stuck in readFile), trigger a compile/save
    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx'] +
        `
        function Other() {
          const t = useExtracted();
          return <div>{t('Hi!')}</div>;
        }`
    );

    // Ensure the "bad save" attempt happens while the read interceptor is still blocking
    await sleep(100);

    resolveReadFile?.();

    // Wait for everything to settle
    await sleep(100);
    await waitForWriteFileCalls(4);

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

      #. This is a description
      #: src/Greeting.tsx
      #, c-format
      msgid "OpKKos"
      msgstr "Hello!"
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

      #. This is a description
      #: src/Greeting.tsx
      #, fuzzy
      msgid "OpKKos"
      msgstr "Hallo!"
      ",
        ],
        [
          "messages/en.po",
          "msgid ""
      msgstr ""
      "Language: en\\n"
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "X-Generator: next-intl\\n"
      "X-Crowdin-SourceKey: msgstr\\n"

      #: src/Greeting.tsx
      msgid "nm/7yQ"
      msgstr "Hi!"

      #. This is a description
      #: src/Greeting.tsx
      #, c-format
      msgid "OpKKos"
      msgstr "Hello!"
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

      #: src/Greeting.tsx
      msgid "nm/7yQ"
      msgstr ""

      #. This is a description
      #: src/Greeting.tsx
      #, fuzzy
      msgid "OpKKos"
      msgstr "Hallo!"
      ",
        ],
      ]
    `);
  });

  it('propagates read errors instead of silently returning empty (prevents translation wipes)', async () => {
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
      msgid "OpKKos"
      msgstr "Hello!"
      `,
      'de.po': `
      #: src/Greeting.tsx
      msgid "OpKKos"
      msgstr "Hallo!"
      `
    };

    // Intercept reading to simulate a corruption/I/O error
    // (not ENOENT - file exists but can't be read)
    let rejectReadFile: ((error: Error) => void) | undefined;
    const readFilePromise = new Promise<void>((_, reject) => {
      rejectReadFile = reject;
    });

    readFileInterceptors.set('de.po', () => readFilePromise);

    using compiler = createCompiler();
    await sleep(50);

    const ioError = new Error('EACCES: permission denied');
    (ioError as NodeJS.ErrnoException).code = 'EACCES';
    rejectReadFile?.(ioError);

    await expect(
      compiler.compile(
        '/project/src/Greeting.tsx',
        filesystem.project.src['Greeting.tsx']
      )
    ).rejects.toThrow('Error while reading de.po: EACCES: permission denied');
  });

  it('returns empty array only for ENOENT (file not found) errors', async () => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    function Greeting() {
      const t = useExtracted();
      return <div>{t('Hello!')}</div>;
    }
    `;

    // Only source locale exists, target locale doesn't exist yet
    filesystem.project.messages = {
      'en.po': `
      #: src/Greeting.tsx
      msgid "OpKKos"
      msgstr "Hello!"
      `
    };

    using compiler = createCompiler();
    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );

    // Should succeed and create empty target locale
    await waitForWriteFileCalls(1);
    expect(vi.mocked(fs.writeFile).mock.calls[0][0]).toBe('messages/en.po');
  });

  it('propagates parser errors from corrupted/truncated files (prevents translation wipes)', async () => {
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
      msgid "OpKKos"
      msgstr "Hello!"
      `,
      // Simulates a truncated file read during concurrent write
      // (file was truncated but read succeeded with partial content)
      'de.po': `
      #: src/Greeting.tsx
      msgid "OpKKos"
      msgstr "Hal`
      // ↑ Truncated mid-write, parser will fail
    };

    using compiler = createCompiler();

    await expect(
      compiler.compile(
        '/project/src/Greeting.tsx',
        filesystem.project.src['Greeting.tsx']
      )
    ).rejects.toThrow('Error while reading de.po: Incomplete quoted string');
  });
});

describe('`srcPath` filtering', () => {
  beforeEach(() => {
    filesystem.project.src['Greeting.tsx'] = `
    import {useExtracted} from 'next-intl';
    import Panel from '@acme/ui/panel';
    function Greeting() {
      const t = useExtracted();
      return <Panel>{t('Hey!')}</Panel>;
    }
    `;

    function createNodeModule(moduleName: string) {
      return `
      import {useExtracted} from 'next-intl';
      export default function Module({children}) {
        const t = useExtracted();
        return (
          <div>
            <h1>{t('${moduleName}')}</h1>
            {children}
          </div>
        )
      }
      `;
    }

    filesystem.project.node_modules = {
      '@acme': {
        ui: {
          'panel.tsx': createNodeModule('panel.source')
        }
      }
    };
    filesystem.project['.next'] = {
      build: {
        'panel.tsx': createNodeModule('panel.compiled')
      }
    };
    filesystem.project['.git'] = {
      config: {
        'panel.tsx': createNodeModule('panel.config')
      }
    };
  });

  function createCompiler(srcPath: string | Array<string>) {
    return new ExtractionCompiler(
      {
        srcPath,
        sourceLocale: 'en',
        messages: {
          path: './messages',
          format: 'json',
          locales: 'infer'
        }
      },
      {isDevelopment: true, projectRoot: '/project'}
    );
  }

  it('skips node_modules, .next and .git by default', async () => {
    using compiler = createCompiler('./');
    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );
    await waitForWriteFileCalls(1);
    expect(vi.mocked(fs.writeFile).mock.calls).toMatchInlineSnapshot(`
      [
        [
          "messages/en.json",
          "{
        "+YJVTi": "Hey!"
      }
      ",
        ],
      ]
    `);
  });

  it('includes node_modules if explicitly requested', async () => {
    using compiler = createCompiler(['./', './node_modules/@acme/ui']);
    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );
    await waitForWriteFileCalls(1);
    expect(vi.mocked(fs.writeFile).mock.calls).toMatchInlineSnapshot(`
      [
        [
          "messages/en.json",
          "{
        "JwjlWH": "panel.source",
        "+YJVTi": "Hey!"
      }
      ",
        ],
      ]
    `);
  });
});

/**
 * Test utils
 ****************************************************************/

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForWriteFileCalls(length: number, opts: {atLeast?: boolean} = {}) {
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

function simulateManualFileEdit(filePath: string, content: string) {
  setNestedValue(filesystem, filePath, content);
  const futureTime = new Date(Date.now() + 1000);
  fileTimestamps.set(filePath, futureTime);
}

function getNestedValue(obj: any, pathname: string): any {
  // Handle both absolute and relative paths
  let pathParts: Array<string>;

  if (pathname.startsWith('/')) {
    // Absolute path: /project/messages/en.json -> project/messages/en.json
    pathParts = pathname.replace(/^\//, '').split('/');
  } else {
    // Relative path: messages/en.json -> project/messages/en.json
    pathParts = ['project', ...pathname.split('/')];
  }

  return pathParts.reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj: any, pathname: string, value: string): void {
  // Handle both absolute and relative paths
  let pathParts: Array<string>;

  if (pathname.startsWith('/')) {
    // Absolute path: /project/messages/en.json -> project/messages/en.json
    pathParts = pathname.replace(/^\//, '').split('/');
  } else {
    // Relative path: messages/en.json -> project/messages/en.json
    pathParts = ['project', ...pathname.split('/')];
  }

  let current = obj;
  for (let i = 0; i < pathParts.length - 1; i++) {
    const key = pathParts[i];
    if (!current[key]) {
      current[key] = {};
    }
    current = current[key];
  }

  current[pathParts[pathParts.length - 1]] = value;
}

function checkDirectoryExists(obj: any, dirPath: string): boolean {
  // Handle both absolute and relative paths
  let pathParts: Array<string>;

  if (dirPath.startsWith('/')) {
    // Absolute path: /project/messages -> project/messages
    pathParts = dirPath.replace(/^\//, '').split('/').filter(Boolean);
  } else {
    // Relative path: messages -> project/messages
    pathParts = ['project', ...dirPath.split('/').filter(Boolean)];
  }

  let current = obj;

  for (const part of pathParts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return false;
    }
  }

  // Directory exists if we successfully traversed the path
  return current !== undefined && typeof current === 'object';
}

function getDirectoryContents(obj: any, dirPath: string): Array<string> {
  // Handle both absolute and relative paths
  let pathParts: Array<string>;

  if (dirPath.startsWith('/')) {
    // Absolute path: /project/messages -> project/messages
    pathParts = dirPath.replace(/^\//, '').split('/').filter(Boolean);
  } else {
    // Relative path: messages -> project/messages
    pathParts = ['project', ...dirPath.split('/').filter(Boolean)];
  }

  let current = obj;

  for (const part of pathParts) {
    if (current && typeof current === 'object') {
      if (part in current) {
        current = current[part];
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

  // If current exists and is an object, return its keys (even if empty)
  if (current && typeof current === 'object') {
    return Object.keys(current);
  }

  return [];
}

const fileTimestamps = new Map<string, Date>();
const watchCallbacks: Map<string, (event: string, filename: string) => void> =
  new Map();
const mockWatchers: Map<string, {close(): void}> = new Map();
const readFileInterceptors = new Map<string, () => Promise<void>>();

function simulateFileEvent(
  dirPath: string,
  event: 'rename',
  filename: string
): void {
  // Try multiple path variations
  const pathsToTry = [
    dirPath,
    path.resolve(dirPath),
    path.join(process.cwd(), dirPath),
    dirPath.replace(/\/$/, ''), // Remove trailing slash
    path.resolve(dirPath).replace(/\/$/, '')
  ];

  let callback;
  for (const testPath of pathsToTry) {
    callback = watchCallbacks.get(testPath);
    if (callback) break;
  }

  // If still not found, try to match by directory name
  if (!callback && watchCallbacks.size > 0) {
    const dirName = path.basename(dirPath);
    for (const [key, cb] of watchCallbacks.entries()) {
      if (
        key.includes(dirName) ||
        key.endsWith(dirPath) ||
        dirPath.includes(key)
      ) {
        callback = cb;
        break;
      }
    }
  }

  if (callback) {
    callback(event, filename);
  } else if (watchCallbacks.size > 0) {
    throw new Error(
      `No watcher found for ${dirPath}. Available: ${Array.from(watchCallbacks.keys()).join(', ')}`
    );
  }
}

vi.mock('fs', () => ({
  default: {
    watch: vi.fn(
      (
        dirPath: string,
        _options: {persistent: boolean; recursive: boolean},
        callback: (event: string, filename: string) => void
      ) => {
        // Store callback with exact path as provided (for test matching)
        // Also store normalized variants for flexibility
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

      let current: any = filesystem;
      for (const part of pathParts) {
        if (typeof current === 'object' && part in current) {
          current = current[part];
        }
      }

      if (opts?.withFileTypes) {
        return contents.map((name) => {
          const value = current?.[name];
          const isDir = value && typeof value === 'object';
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
      if (typeof content === 'string') {
        return {
          mtime: fileTimestamps.get(filePath) || new Date()
        };
      }
      throw new Error('File not found: ' + filePath);
    })
  }
}));

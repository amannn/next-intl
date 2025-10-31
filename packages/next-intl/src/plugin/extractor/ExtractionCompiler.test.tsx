import fs from 'fs/promises';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import ExtractionCompiler from './ExtractionCompiler.js';

const filesystem: {
  project: {
    src: Record<string, string>;
    messages: Record<string, string> | undefined;
  };
} = {
  project: {
    src: {},
    messages: undefined
  }
};

describe('json format', () => {
  beforeEach(() => {
    filesystem.project.src = {};
    filesystem.project.messages = {};
    fileTimestamps.clear();
    vi.clearAllMocks();
  });

  function createCompiler() {
    return new ExtractionCompiler(
      {
        srcPath: './src',
        sourceLocale: 'en',
        messages: {
          path: './messages',
          format: 'json'
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

    const compiler = createCompiler();

    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );

    expect(vi.mocked(fs.writeFile).mock.calls).toMatchInlineSnapshot(`
    [
      [
        "messages/en.json",
        "{
      "+YJVTi": "Hey!"
    }",
      ],
      [
        "messages/de.json",
        "{
      "+YJVTi": "Hallo!"
    }",
      ],
    ]
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

    const compiler = createCompiler();

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
        "messages/en.json",
        "{
      "OpKKos": "Hello!"
    }",
      ],
      [
        "messages/de.json",
        "{
      "OpKKos": ""
    }",
      ],
    ]
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

    const compiler = createCompiler();

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
        "{}",
      ],
      [
        "messages/de.json",
        "{}",
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

    const compiler = createCompiler();

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
        "{}",
      ],
      [
        "messages/de.json",
        "{}",
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
    }",
      ],
      [
        "messages/de.json",
        "{
      "+YJVTi": "Hallo!"
    }",
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

    const compiler = createCompiler();

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
    }",
      ],
      [
        "messages/de.json",
        "{
      "ui": {
        "OpKKos": ""
      }
    }",
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

    const compiler = createCompiler();

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
    }",
          "en.json": "{
      "+YJVTi": "Hey!"
    }",
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
      }",
        "en.json": "{
        "NnE1NP": "Goodbye!",
        "OpKKos": "Hello!"
      }",
      }
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

    const compiler = createCompiler();

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
});

describe('po format', () => {
  beforeEach(() => {
    filesystem.project.src = {};
    filesystem.project.messages = {};
    fileTimestamps.clear();
    vi.clearAllMocks();
  });

  function createCompiler() {
    return new ExtractionCompiler(
      {
        srcPath: './src',
        sourceLocale: 'en',
        messages: {
          path: './messages',
          format: 'po'
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

    const compiler = createCompiler();

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

    const compiler = createCompiler();

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

    const compiler = createCompiler();

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

      #: src/Greeting.tsx
      #: src/Footer.tsx
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
      #: src/Footer.tsx
      msgid "+YJVTi"
      msgstr "Hallo!"
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

    const compiler = createCompiler();

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

    const compiler = createCompiler();

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
    const compiler = createCompiler();

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
});

/**
 * Test utils
 */

function waitForWriteFileCalls(length: number) {
  return vi.waitFor(() => {
    expect(vi.mocked(fs.writeFile).mock.calls.length).toBe(length);
  });
}

function simulateManualFileEdit(filePath: string, content: string) {
  setNestedValue(filesystem, filePath, content);
  const futureTime = new Date(Date.now() + 1000);
  fileTimestamps.set(filePath, futureTime);
}

function getNestedValue(obj: any, path: string): any {
  // Handle both absolute and relative paths
  let pathParts: Array<string>;

  if (path.startsWith('/')) {
    // Absolute path: /project/messages/en.json -> project/messages/en.json
    pathParts = path.replace(/^\//, '').split('/');
  } else {
    // Relative path: messages/en.json -> project/messages/en.json
    pathParts = ['project', ...path.split('/')];
  }

  return pathParts.reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj: any, path: string, value: string): void {
  // Handle both absolute and relative paths
  let pathParts: Array<string>;

  if (path.startsWith('/')) {
    // Absolute path: /project/messages/en.json -> project/messages/en.json
    pathParts = path.replace(/^\//, '').split('/');
  } else {
    // Relative path: messages/en.json -> project/messages/en.json
    pathParts = ['project', ...path.split('/')];
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

vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(async (filePath: string) => {
      const content = getNestedValue(filesystem, filePath);
      if (typeof content === 'string') {
        return content;
      }
      throw new Error('File not found: ' + filePath);
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

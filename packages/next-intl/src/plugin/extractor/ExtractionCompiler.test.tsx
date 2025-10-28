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
  let compiler: ExtractionCompiler;
  beforeEach(() => {
    vi.clearAllMocks();

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
    fileTimestamps.clear();

    compiler = new ExtractionCompiler(
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

    return () => {
      compiler.destroy();
    };
  });

  it('saves messages initially', async () => {
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
  let compiler: ExtractionCompiler;
  beforeEach(() => {
    vi.clearAllMocks();

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
    fileTimestamps.clear();

    compiler = new ExtractionCompiler(
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

    return () => {
      compiler.destroy();
    };
  });

  it('saves messages initially', async () => {
    await compiler.compile(
      '/project/src/Greeting.tsx',
      filesystem.project.src['Greeting.tsx']
    );
    expect(vi.mocked(fs.writeFile).mock.calls).toMatchInlineSnapshot(`
      [
        [
          "messages/en.po",
          "#: src/Greeting.tsx
      msgid "+YJVTi"
      msgstr "Hey!"
      ",
        ],
        [
          "messages/de.po",
          "#: src/Greeting.tsx
      msgid "+YJVTi"
      msgstr "Hallo!"
      ",
        ],
      ]
    `);
  });

  it('can extract descriptions', async () => {
    await compiler.compile(
      '/project/src/Greeting.tsx',
      `
      import {useExtracted} from 'next-intl';
      function Greeting() {
        const t = useExtracted();
        return <div>{t({message: 'Hey!', description: 'Shown on home screen'})}</div>;
      }
      `
    );
    await waitForWriteFileCalls(4);
    expect(vi.mocked(fs.writeFile).mock.calls.slice(2)).toMatchInlineSnapshot(`
      [
        [
          "messages/en.po",
          "#: src/Greeting.tsx
      #. Shown on home screen
      msgid "+YJVTi"
      msgstr "Hey!"
      ",
        ],
        [
          "messages/de.po",
          "#: src/Greeting.tsx
      #. Shown on home screen
      msgid "+YJVTi"
      msgstr "Hallo!"
      ",
        ],
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
    if (current && typeof current === 'object' && current[part]) {
      current = current[part];
    } else {
      return [];
    }
  }

  return Object.keys(current || {});
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
      const contents = getDirectoryContents(filesystem, dir);

      if (contents.length === 0) {
        throw new Error('Directory not found: ' + dir);
      }

      if (opts?.withFileTypes) {
        return contents.map((fileName) => ({
          name: fileName,
          isDirectory: () => false,
          isFile: () => true
        }));
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

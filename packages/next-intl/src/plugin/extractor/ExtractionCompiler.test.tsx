import fs from 'fs/promises';
import {beforeEach, expect, it, vi} from 'vitest';
import ExtractionCompiler from './ExtractionCompiler.js';

const filesystem = {
  project: {
    src: {
      'Greeting.tsx': `
        import {useExtracted} from 'next-intl';
        function Greeting() {
          const t = useExtracted();
          return <div>{t('Hey!')}</div>;
        }
        `
    },
    messages: {
      'en.json': '{"+YJVTi": "Hey!"}',
      'de.json': '{"+YJVTi": "Hallo!"}'
    }
  }
};

let compiler: ExtractionCompiler;
beforeEach(() => {
  vi.clearAllMocks();
  compiler = new ExtractionCompiler(
    {
      formatter: 'json',
      messagesPath: './messages',
      sourceLocale: 'en',
      srcPath: './src'
    },
    {isDevelopment: true, projectRoot: '/project'}
  );
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

/**
 * Test utils
 */

function waitForWriteFileCalls(length: number) {
  return vi.waitFor(() => {
    expect(vi.mocked(fs.writeFile).mock.calls.length).toBe(length);
  });
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
    writeFile: vi.fn(async () => {})
  },
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
  writeFile: vi.fn(async () => {})
}));

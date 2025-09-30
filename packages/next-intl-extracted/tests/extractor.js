const {
  extractFileMessages,
  loadSourceMessages
} = require('../dist/extractor/index.js');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

async function testExtractFileMessages() {
  console.log('=== Test 1: extractFileMessages ===');

  const sourceCode = `
    import { useExtracted } from 'next-intl';
    
    export default function MyComponent() {
      const t = useExtracted();
      return (
        <div>
          <h1>{t('Hello {name}', {name: 'Jane'})}</h1>
          <p>{t('How are you?')}</p>
        </div>
      );
    }
  `;

  // Create a temp test file
  const tempFile = path.join(os.tmpdir(), 'test-component.tsx');
  await fs.writeFile(tempFile, sourceCode);

  try {
    console.time('extractFileMessages');
    const messages = await extractFileMessages(tempFile);
    console.timeEnd('extractFileMessages');

    console.log('Messages found:', messages.length);
    console.log(JSON.stringify(messages, null, 2));
  } finally {
    // Clean up
    await fs.unlink(tempFile);
  }
}

async function testLoadSourceMessages() {
  console.log('\n=== Test 2: loadSourceMessages ===');

  // Create a temporary directory structure with multiple files
  const tempDir = path.join(os.tmpdir(), 'test-src-' + Date.now());
  await fs.mkdir(tempDir);
  await fs.mkdir(path.join(tempDir, 'components'));
  await fs.mkdir(path.join(tempDir, 'node_modules'));
  await fs.mkdir(path.join(tempDir, 'pages'));

  const files = [
    {
      path: path.join(tempDir, 'components', 'Header.tsx'),
      content: `
        import { useExtracted } from 'next-intl';
        export default function Header() {
          const t = useExtracted();
          return <header>{t('Welcome')}</header>;
        }
      `
    },
    {
      path: path.join(tempDir, 'components', 'Footer.tsx'),
      content: `
        import { useExtracted } from 'next-intl';
        export default function Footer() {
          const t = useExtracted();
          return <footer>{t('Copyright 2025')}</footer>;
        }
      `
    },
    {
      path: path.join(tempDir, 'pages', 'Home.tsx'),
      content: `
        import { useExtracted } from 'next-intl';
        export default function Home() {
          const t = useExtracted();
          return (
            <main>
              <h1>{t('Home Page')}</h1>
              <p>{t('Welcome to our site')}</p>
            </main>
          );
        }
      `
    },
    {
      path: path.join(tempDir, 'utils.ts'),
      content: `
        // No useExtracted, should be skipped
        export function helper() {
          return 'no messages here';
        }
      `
    },
    {
      path: path.join(tempDir, 'node_modules', 'some-lib.js'),
      content: `
        // Should be ignored due to node_modules filter
        const t = useExtracted();
        t('This should not be found');
      `
    }
  ];

  // Create all test files
  for (const file of files) {
    await fs.writeFile(file.path, file.content);
  }

  try {
    console.time('loadSourceMessages');
    const results = await loadSourceMessages(
      tempDir,
      ['.ts', '.tsx', '.js', '.jsx'],
      ['node_modules', '.git', 'dist']
    );
    console.timeEnd('loadSourceMessages');

    console.log('Files processed:', results.length);
    console.log(
      'Total messages:',
      results.reduce((sum, r) => sum + r.messages.length, 0)
    );

    console.log('\nResults per file:');
    for (const result of results) {
      console.log(
        `  ${path.basename(result.filePath)}: ${result.messages.length} messages`
      );
      if (result.messages.length > 0) {
        result.messages.forEach((msg) => {
          console.log(`    - ${msg.id}: "${msg.message}"`);
        });
      }
    }
  } finally {
    // Clean up
    await fs.rm(tempDir, {recursive: true, force: true});
  }
}

async function runTests() {
  try {
    await testExtractFileMessages();
    await testLoadSourceMessages();
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();

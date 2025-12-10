import {bench} from 'vitest';
import MessageExtractor from './MessageExtractor.js';

const testCode = `
  import {useExtracted} from 'next-intl';

  function Component() {
    const t = useExtracted();
    t("Hello, {name}!", {name: 'Alice'});
    t("Welcome!");
    t.rich("Hello <b>World</b>!", {b: (chunks) => <b>{chunks}</b>});
    t.markup("Click <a>here</a>", {a: (chunks) => \`<a>\${chunks}</a>\`});
    t.has("Test message");
  }

  function AnotherComponent() {
    const t = useExtracted('ui');
    t("Button label");
    t("Submit");
  }
`;

bench('extract messages without source maps', async () => {
  const extractor = new MessageExtractor({
    isDevelopment: true,
    projectRoot: '/project',
    sourceMap: false
  });

  await extractor.extract('/project/test.tsx', testCode);
});

bench('extract messages with source maps', async () => {
  const extractor = new MessageExtractor({
    isDevelopment: true,
    projectRoot: '/project',
    sourceMap: true
  });

  await extractor.extract('/project/test.tsx', testCode);
});

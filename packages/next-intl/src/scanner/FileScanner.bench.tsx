import {bench} from 'vitest';
import FileScanner from './FileScanner.js';

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

bench('scan file without source maps', async () => {
  const fileScanner = new FileScanner({
    isDevelopment: true,
    projectRoot: '/project',
    sourceMap: false
  });

  await fileScanner.scan('/project/test.tsx', testCode);
});

bench('scan file with source maps', async () => {
  const fileScanner = new FileScanner({
    isDevelopment: true,
    projectRoot: '/project',
    sourceMap: true
  });

  await fileScanner.scan('/project/test.tsx', testCode);
});

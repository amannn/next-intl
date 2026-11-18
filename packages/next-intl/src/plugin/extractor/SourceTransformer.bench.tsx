import {bench} from 'vitest';
import SourceTransformer from './SourceTransformer.js';

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

bench('transform without source maps', async () => {
  const transformer = new SourceTransformer({
    isDevelopment: true,
    projectRoot: '/project',
    sourceMap: false
  });

  await transformer.transform('/project/test.tsx', testCode);
});

bench('transform with source maps', async () => {
  const transformer = new SourceTransformer({
    isDevelopment: true,
    projectRoot: '/project',
    sourceMap: true
  });

  await transformer.transform('/project/test.tsx', testCode);
});
